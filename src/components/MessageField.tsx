import { createSignal, Show, untrack, useContext } from 'solid-js';
import { actions } from 'astro:actions';
import Loading, { LoadingContext } from '@glowman554/base-components/src/loading/Loading';
import { withQuery } from '@glowman554/base-components/src/query/Query';
import './Editor.css';

function Wrapped() {
    const loading = useContext(LoadingContext);
    const [message, setMessage] = createSignal('');
    const [messageSent, setMessageSent] = createSignal(false);

    return (
        <div class="editor-container">
            <div class="center">
                <h4>Send me a message</h4>
            </div>
            <br />
            <Show
                when={!messageSent()}
                fallback={
                    <div class="center">
                        <h4>Message successfully sent!</h4>
                    </div>
                }
            >
                <textarea
                    class="editor-content-textfield"
                    style={{ height: '10rem' }}
                    value={message()}
                    onInput={(e) => setMessage(e.target.value)}
                />
                <button
                    onClick={() => {
                        withQuery(
                            () => actions.messages.message.orThrow({ message: untrack(message) }),
                            loading,
                            true,
                            () => setMessageSent(true)
                        );
                    }}
                >
                    Send
                </button>
            </Show>
        </div>
    );
}

export default function () {
    return (
        <Loading initial={false}>
            <Wrapped />
        </Loading>
    );
}
