cp ../../MicroOS/mckrnl/mckrnl.elf cdrom/mckrnl.elf
cp ../../MicroOS/mckrnl/mckrnl.syms cdrom/mckrnl.syms
cp ../../MicroOS/res/initrd.saf cdrom/initrd.saf

xorriso -as mkisofs -R -r -J -b boot/limine/limine-cd.bin \
	-no-emul-boot -boot-load-size 4 -boot-info-table -hfsplus \
	-apm-block-size 2048 --efi-boot boot/limine/limine-cd-efi.bin \
    -efi-boot-part --efi-boot-image --protective-msdos-label \
	cdrom -o ../public/microos/cdrom.iso
