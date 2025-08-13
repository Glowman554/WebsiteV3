import Overlay from '@glowman554/base-components/src/generic/Overlay';
import { createSignal } from 'solid-js';
import TextGenerator from './TextGenerator';

export interface Props {
    system: string;
    text: string;
}

export default function (props: Props) {
    const [textGeneratorVisible, setTextGeneratorVisible] = createSignal(false);

    return (
        <>
            <button class="button" type="button" onClick={() => setTextGeneratorVisible(true)}>
                {props.text}
            </button>
            <Overlay visible={textGeneratorVisible()} reset={() => setTextGeneratorVisible(false)}>
                <TextGenerator system={props.system} />
            </Overlay>
        </>
    );
}
