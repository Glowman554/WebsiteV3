import Overlay from '@glowman554/base-components/src/generic/Overlay';
import { createSignal } from 'solid-js';
import ImageGenerator from './ImageGenerator';

export default function () {
    const [imageGeneratorVisible, setImageGeneratorVisible] = createSignal(false);
    return (
        <>
            <button class="button" type="button" onClick={() => setImageGeneratorVisible(true)}>
                Generate image
            </button>
            <Overlay visible={imageGeneratorVisible()} reset={() => setImageGeneratorVisible(false)}>
                <ImageGenerator />
            </Overlay>
        </>
    );
}
