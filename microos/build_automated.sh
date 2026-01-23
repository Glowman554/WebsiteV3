set -e

prepare_upload() {
	local file_name="$1"

	if [[ -z "$file_name" ]]; then
		echo "Usage: prepare_upload <file_name>" >&2
		return 1
	fi

	if [[ -z "$UPLOAD_SERVER" || -z "$UPLOAD_AUTH_TOKEN" ]]; then
		echo "UPLOAD_SERVER and UPLOAD_AUTH_TOKEN must be set" >&2
		return 1
	fi

	local response
	response=$(curl -sS -w "\n%{http_code}" \
		-X POST "$UPLOAD_SERVER/api/v1/prepare" \
		-H "Content-Type: application/json" \
		-H "Authentication: $UPLOAD_AUTH_TOKEN" \
		-d "{\"name\":\"$file_name\"}"
	)

	local body
	local status
	body=$(echo "$response" | sed '$d')
	status=$(echo "$response" | tail -n1)

	if [[ "$status" -lt 200 || "$status" -ge 300 ]]; then
		echo "Failed to prepare upload (HTTP $status)" >&2
		echo "$body" >&2
		return 1
	fi

	echo "$body"
}

upload() {
	local file="$1"
	local url="$2"
	local token="$3"

	if [[ -z "$file" || -z "$url" || -z "$token" ]]; then
		echo "Usage: upload <file> <url> <token>" >&2
		return 1
	fi

	if [[ ! -f "$file" ]]; then
		echo "File not found: $file" >&2
		return 1
	fi

	local status
	status=$(curl -sS -o /dev/null -w "%{http_code}" \
		-X POST "$url" \
		-H "Authentication: $token" \
		--data-binary @"$file"
	)

	if [[ "$status" -lt 200 || "$status" -ge 300 ]]; then
		echo "Failed to upload file (HTTP $status)" >&2
		return 1
	fi
}


upload_file() {
	local file="$1"

	if [[ -z "$file" ]]; then
		echo "Usage: upload_file <file>" >&2
		return 1
	fi

	local response
	response=$(prepare_upload "$(basename "$file")") || return 1

	local upload_url
	local upload_token

	upload_url=$(echo "$response" | jq -r '.url')
	upload_token=$(echo "$response" | jq -r '.uploadToken')

	if [[ -z "$upload_url" || -z "$upload_token" || "$upload_url" == "null" ]]; then
		echo "Invalid prepare_upload response" >&2
		return 1
	fi

	upload "$file" "$upload_url" "$upload_token"

	echo "$upload_url"
}



if [ "$#" -ne 4 ]; then
	echo "Usage: $0 <preset> <kernel> <symbols> <initrd>"
else
	preset=$1
	kernel=$2
	symbols=$3
	initrd=$4

	build_dir="/tmp/microos_build_$preset"
	if [ -d "$build_dir" ]; then
		rm -rf "$build_dir"
	fi
	mkdir -p "$build_dir"
	cp -r * "$build_dir"

	(
		cd "$build_dir"

		curl -sSL "$kernel" -o cdrom/mckrnl.elf
		curl -sSL "$symbols" -o cdrom/mckrnl.syms
		curl -sSL "$initrd" -o cdrom/initrd.saf

		xorriso -as mkisofs -R -r -J -b boot/limine/limine-cd.bin \
			-no-emul-boot -boot-load-size 4 -boot-info-table -hfsplus \
			-apm-block-size 2048 --efi-boot boot/limine/limine-cd-efi.bin \
			-efi-boot-part --efi-boot-image --protective-msdos-label \
			cdrom -o "microos_${preset}.iso" > /dev/null 2>&1

		result=$(upload_file "microos_${preset}.iso")
		echo "$result"
	)
fi