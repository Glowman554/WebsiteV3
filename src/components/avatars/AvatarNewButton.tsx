import { createSignal } from 'solid-js';
import { actions } from 'astro:actions';
import AvatarEditor from './AvatarEditor';
import Overlay from '@glowman554/base-components/src/generic/Overlay';
import { withQuery } from '@glowman554/base-components/src/query/Query';

export default function () {
    const [newVisible, setNewVisible] = createSignal(false);
    return (
        <>
            <button class="button" onClick={() => setNewVisible(true)}>
                New avatar
            </button>
            <Overlay visible={newVisible()} reset={() => setNewVisible(false)}>
                <AvatarEditor
                    submit={(name, modelUrl, configuration, hidden, loading) =>
                        withQuery(
                            () => actions.avatars.create.orThrow({ name, modelUrl, configuration, hidden }),
                            loading,
                            true,
                            () => location.reload()
                        )
                    }
                />
            </Overlay>
        </>
    );
}
