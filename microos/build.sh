wget https://files.catbox.moe/7shdyq.elf -O cdrom/mckrnl.elf
wget https://files.catbox.moe/ncan2m.syms -O cdrom/mckrnl.syms
wget https://files.catbox.moe/h9pxdh.saf -O cdrom/initrd.saf

xorriso -as mkisofs -R -r -J -b boot/limine/limine-cd.bin \
	-no-emul-boot -boot-load-size 4 -boot-info-table -hfsplus \
	-apm-block-size 2048 --efi-boot boot/limine/limine-cd-efi.bin \
    -efi-boot-part --efi-boot-image --protective-msdos-label \
	cdrom -o ../public/microos/cdrom.iso
