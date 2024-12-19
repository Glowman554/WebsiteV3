import { createSignal } from 'solid-js';
import { actions } from 'astro:actions';
import PostEditor from './PostEditor';
import Overlay from '@glowman554/base-components/src/generic/Overlay';
import { withQuery } from '@glowman554/base-components/src/query/Query';

export default function () {
    const [newVisible, setNewVisible] = createSignal(false);
    return (
        <>
            <button class="button" onClick={() => setNewVisible(true)}>
                New post
            </button>
            <Overlay visible={newVisible()}>
                <PostEditor
                    submit={(title, content, loading) =>
                        withQuery(
                            () => actions.posts.create.orThrow({ title, content }),
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
