import { createSignal, Show, untrack, useContext } from 'solid-js';
import { actions } from 'astro:actions';
import Loading, { LoadingContext } from '@glowman554/base-components/src/loading/Loading';
import { withQuery } from '@glowman554/base-components/src/query/Query';

function Wrapped() {
    const loading = useContext(LoadingContext);
    const [message, setMessage] = createSignal('');
    const [messageSent, setMessageSent] = createSignal(false);

    return (
        <div class="flex flex-col rounded-xl bg-neutral-800 p-2">
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
                    class="input mb-2 h-40 resize-none"
                    value={message()}
                    onInput={(e) => setMessage(e.target.value)}
                />
                <button
                    class="button"
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
