import { createSignal } from 'solid-js';
import { actions } from 'astro:actions';
import DownloadEditor from './DownloadEditor';
import Overlay from '@glowman554/base-components/src/generic/Overlay';
import { withQuery } from '@glowman554/base-components/src/query/Query';

export default function () {
    const [newVisible, setNewVisible] = createSignal(false);
    return (
        <>
            <button onClick={() => setNewVisible(true)}>New download</button>
            <Overlay visible={newVisible()}>
                <DownloadEditor
                    submit={(name, link, loading) =>
                        withQuery(
                            () => actions.downloads.create.orThrow({ link, name }),
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
