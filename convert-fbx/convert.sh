function convert {
    input=$1
    basename=$(basename "$input" .fbx)
    output="$basename.glb"

    cp $input input.fbx
    blender -P export_glb.py
    node ../node_modules/@gltf-transform/cli/bin/cli.js resize output.glb $output --width 1024 --height 1024
}

convert "Whirly_pooltoy.fbx"
convert "Whirly.fbx"
convert "Toxic.fbx"