import { createSignal, untrack, useContext } from 'solid-js';
import { actions } from 'astro:actions';
import Loading, { LoadingContext } from '@glowman554/base-components/src/loading/Loading';
import { withQuery } from '@glowman554/base-components/src/query/Query';

export interface Props {
    callback: (text: string) => void;
    system: string;
}

function Wrapped(props: Props) {
    const loading = useContext(LoadingContext);
    const [prompt, setPrompt] = createSignal('');

    const submit = () => {
        withQuery(
            () => actions.openAi.generate.orThrow({ system: untrack(() => props.system), prompt: untrack(prompt) }),
            loading,
            false,
            (text) => {
                if (text) {
                    untrack(() => props.callback)(text);
                }
            }
        );
    };

    return (
        <form
            on:submit={(e) => {
                e.preventDefault();
                submit();
            }}
        >
            <div class="editor-container">
                <textarea
                    class="editor-content-textfield"
                    value={prompt()}
                    onChange={(e) => setPrompt(e.target.value)}
                    required
                />

                <div class="center">
                    <button type="submit">Generate</button>
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
