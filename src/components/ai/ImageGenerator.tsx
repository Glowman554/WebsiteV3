import { createSignal, Show, untrack, useContext } from 'solid-js';
import { actions } from 'astro:actions';
import Loading, { LoadingContext } from '@glowman554/base-components/src/loading/Loading';
import { withQuery } from '@glowman554/base-components/src/query/Query';

export interface Props {
    callback: (url: string) => void;
}

function Wrapped(props: Props) {
    const loading = useContext(LoadingContext);
    const [prompt, setPrompt] = createSignal('');
    const [previewUrl, setPreviewUrl] = createSignal<string>();

    const submit = () => {
        withQuery(
            () => actions.openAi.generateImage.orThrow({ prompt: untrack(prompt) }),
            loading,
            true,
            setPreviewUrl
        );
    };

    const use = () => {
        const prev = previewUrl();
        if (prev) {
            withQuery(
                () => actions.uploads.uploadFromUrl.orThrow({ url: prev }),
                loading,
                true,
                untrack(() => props.callback)
            );
        }
    };

    return (
        <form
            on:submit={(e) => {
                e.preventDefault();
                submit();
            }}
        >
            <div class="editor-container">
                <Show when={previewUrl()}>
                    <div class="center">
                        <img
                            style={{
                                'max-height': '40vh',
                                'min-width': '0',
                            }}
                            src={previewUrl()}
                        />
                    </div>
                    <br />
                </Show>

                <input
                    class="editor-title-input"
                    value={prompt()}
                    onChange={(e) => setPrompt(e.target.value)}
                    required
                />

                <div class="center">
                    <button type="submit">Generate</button>
                    <button type="button" onClick={use}>
                        Use
                    </button>
                </div>
            </div>
        </form>
    );
}

export default function (props: Props) {
    return (
        <Loading initial={false}>
            <Wrapped {...props} />
        </Loading>
    );
}
