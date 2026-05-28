import bpy

fbx_path = "input.fbx"
out_path = "output.glb"

# -------------------------
# CLEAN SCENE
# -------------------------
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)

# -------------------------
# IMPORT FBX (IMPORTANT SETTINGS)
# -------------------------
bpy.ops.import_scene.fbx(
    filepath=fbx_path,
    automatic_bone_orientation=False,  # IMPORTANT: preserve original bone rotations
    force_connect_children=True,
    use_prepost_rot=True
)

# -------------------------
# DO NOT APPLY TRANSFORMS TO ANYTHING
# -------------------------

# OPTIONAL: fix only scene scale (safe)
bpy.context.scene.unit_settings.system = 'METRIC'
bpy.context.scene.unit_settings.scale_length = 1.0

# Ensure all armatures are in REST position
# for obj in bpy.context.scene.objects:
#     if obj.type == 'ARMATURE':
#         obj.data.pose_position = 'REST'

# # -------------------------
# # EXPORT GLTF (CRITICAL SETTINGS)
# # -------------------------
bpy.ops.export_scene.gltf(
    filepath=out_path,
    export_format='GLB',

    export_apply=False,
    export_skins=True,
    export_morph=True,

    export_rest_position_armature=False,

    export_yup=True
)

bpy.ops.wm.quit_blender()