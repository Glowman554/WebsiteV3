import Loading, { LoadingContext } from '@glowman554/base-components/src/loading/Loading';
import { onMount, onCleanup, useContext, createSignal } from 'solid-js';

import * as THREE from 'three';

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import z from 'zod';

// interface ViewerConfiguration {
//     visibility: {
//         [name: string]: boolean;
//     };
//     rotation: {
//         [name: string]: {
//             x: number;
//             y: number;
//             z: number;
//         };
//     };
//     blendShapes: {
//         [name: string]: number;
//     };
// }
// create using zod
const schema = z.object({
    visibility: z.record(z.string(), z.boolean()),
    rotation: z.record(
        z.string(),
        z.object({
            x: z.number(),
            y: z.number(),
            z: z.number(),
        })
    ),
    blendShapes: z.record(z.string(), z.number()),
});

export function validateConfiguration(config: any): ViewerConfiguration {
    const result = schema.safeParse(config);
    if (!result.success) {
        console.log(result.error);
        throw new Error('Field validation failed');
    }
    return result.data;
}

type ViewerConfiguration = z.infer<typeof schema>;

export interface ModelViewerProps {
    href: string;
    configuration: ViewerConfiguration;
}

function Wrapped(props: ModelViewerProps) {
    let container: HTMLDivElement | undefined;
    const loading = useContext(LoadingContext);

    const [skeletonHelpers, setSkeletonHelpers] = createSignal<THREE.SkeletonHelper[]>([]);
    const [showSkeleton, setShowSkeleton] = createSignal(false);

    const updateSkeletonHelpersVisibility = () => {
        skeletonHelpers().forEach((helper) => {
            helper.visible = showSkeleton();
        });
    };

    onMount(() => {
        loading.setLoading(true);

        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x222222);

        const camera = new THREE.PerspectiveCamera(75, container!.clientWidth / container!.clientHeight, 0.1, 1000);
        camera.position.set(0, 1.5, 2);
        camera.lookAt(0, 1.5, 0);

        const renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true,
        });
        renderer.setSize(container!.clientWidth, container!.clientHeight);
        renderer.setPixelRatio(window.devicePixelRatio);

        container!.appendChild(renderer.domElement);

        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.target.set(0, 1, 0);

        const ambientLight = new THREE.AmbientLight(0xffffff, 1);

        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 3);
        directionalLight.position.set(5, 10, 5);

        scene.add(directionalLight);

        const grid = new THREE.GridHelper(10, 10);

        scene.add(grid);

        const loader = new GLTFLoader();

        loader.load(
            props.href,
            (gltf) => {
                const model = gltf.scene;

                const bones: string[] = [];
                const meshes: string[] = [];
                const blendShapes = new Set<string>();
                const skeletonHelpersList: THREE.SkeletonHelper[] = [];

                model.traverse((child) => {
                    if ((child as THREE.Bone).isBone) {
                        bones.push(child.name);

                        if (props.configuration.rotation[child.name]) {
                            console.log(
                                `Applying rotation to bone ${child.name}:`,
                                props.configuration.rotation[child.name]
                            );
                            child.rotation.set(
                                THREE.MathUtils.degToRad(props.configuration.rotation[child.name].x),
                                THREE.MathUtils.degToRad(props.configuration.rotation[child.name].y),
                                THREE.MathUtils.degToRad(props.configuration.rotation[child.name].z)
                            );
                        }
                    }

                    if ((child as THREE.Mesh).isMesh) {
                        const mesh = child as THREE.Mesh;
                        mesh.castShadow = true;
                        mesh.receiveShadow = true;

                        if (mesh.material) {
                            const material = mesh.material as THREE.Material;
                            material.alphaTest = 0.5;
                            material.transparent = false;
                            material.depthWrite = true;
                            material.depthTest = true;
                        }

                        meshes.push(child.name);

                        if (props.configuration.visibility[child.name] !== undefined) {
                            console.log(
                                `Setting visibility of mesh ${child.name} to ${props.configuration.visibility[child.name]}`
                            );
                            child.visible = props.configuration.visibility[child.name];
                        }

                        if (mesh.morphTargetDictionary) {
                            for (const [name, index] of Object.entries(mesh.morphTargetDictionary)) {
                                blendShapes.add(name);

                                if (props.configuration.blendShapes[name] !== undefined) {
                                    console.log(
                                        `Setting blend shape ${name} to ${props.configuration.blendShapes[name]} on mesh ${child.name}`
                                    );
                                    mesh.morphTargetInfluences![index] = props.configuration.blendShapes[name];
                                }
                            }
                        }
                    }

                    if ((child as THREE.SkinnedMesh).isSkinnedMesh) {
                        const helper = new THREE.SkeletonHelper(model);
                        const material = helper.material as THREE.LineBasicMaterial;
                        material.linewidth = 2;
                        material.color.set(0xff0000);
                        scene.add(helper);

                        skeletonHelpersList.push(helper);
                    }
                });

                console.log(JSON.stringify({ bones, meshes, blendShapes: Array.from(blendShapes) }, null, 2));

                scene.add(model);

                setSkeletonHelpers(skeletonHelpersList);
                updateSkeletonHelpersVisibility();
                loading.setLoading(false);

                handleResize();
            },

            (progress) => {
                loading.setProgress((progress.loaded / progress.total) * 100);
            },

            (error) => {
                console.error(error);
                loading.setError(new String(error).toString());
            }
        );

        const handleResize = () => {
            camera.aspect = container!.clientWidth ? container!.clientWidth / container!.clientHeight : 1;
            camera.updateProjectionMatrix();

            renderer.setSize(container!.clientWidth || 0, container!.clientHeight || 0);
        };

        window.addEventListener('resize', handleResize);

        let animationFrameId: number;

        const animate = () => {
            animationFrameId = requestAnimationFrame(animate);

            controls.update();

            renderer.render(scene, camera);
        };

        animate();

        onCleanup(() => {
            cancelAnimationFrame(animationFrameId);

            window.removeEventListener('resize', handleResize);

            controls.dispose();

            renderer.dispose();

            container!.removeChild(renderer.domElement);
        });
    });

    return (
        <>
        <div
            ref={container}
            style={{
                width: '80vw',
                height: '80vh',
                // overflow: 'hidden',
            }}
        />
        <div class="center">
            <button class="button" onClick={() => {
                setShowSkeleton(!showSkeleton())
                updateSkeletonHelpersVisibility();
            }}>
                {showSkeleton() ? 'Hide Skeleton' : 'Show Skeleton'}
            </button>
        </div>
        </>
    );
}

export default function ModelViewer(props: ModelViewerProps) {
    return (
        <Loading initial={true} progressBar={true}>
            <Wrapped {...props} />
        </Loading>
    );
}
