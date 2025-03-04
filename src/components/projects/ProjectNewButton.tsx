import { createSignal } from 'solid-js';
import ProjectEditor from './ProjectEditor';
import { actions } from 'astro:actions';
import Overlay from '@glowman554/base-components/src/generic/Overlay';
import { withQuery } from '@glowman554/base-components/src/query/Query';

export default function () {
    const [newVisible, setNewVisible] = createSignal(false);
    return (
        <>
            <button class="button" onClick={() => setNewVisible(true)}>
                New project
            </button>
            <Overlay visible={newVisible()} reset={() => setNewVisible(false)}>
                <ProjectEditor
                    submit={(name, link, description, loading) =>
                        withQuery(
                            () => actions.projects.create.orThrow({ link, name, description }),
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
