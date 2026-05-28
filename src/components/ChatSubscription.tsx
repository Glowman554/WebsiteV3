import { createSignal, onCleanup, onMount, Show, useContext } from 'solid-js';
import Loading, { LoadingContext } from '@glowman554/base-components/src/loading/Loading';
import { createQuery, withQuery } from '@glowman554/base-components/src/query/Query';
import { actions } from 'astro:actions';
import type { ChatMessage } from '../actions/chat';
import DeleteButton from '@glowman554/base-components/src/generic/DeleteButton';

export function urlWithPrefix(url: string, ws: boolean): string {
    const prefix = localStorage.getItem('prefix');
    const prefixed = prefix ? prefix + url : url;

    if (ws) {
        if (!prefixed.startsWith('http')) {
            return prefixed;
        }
        const parsed = new URL(prefixed);
        parsed.protocol = parsed.protocol === 'http:' ? 'ws:' : 'wss:';
        return parsed.href;
    }

    return prefixed;
}

function createSubscription() {
    const [websocket, setWebsocket] = createSignal<WebSocket | null>(null);
    const [history, setHistory] = createSignal<ChatMessage[]>([]);

    const connect = () => {
        const ws = new WebSocket(urlWithPrefix('/api/v1/chat/subscribe', true));
        ws.onopen = () => {
            console.log('websocket opened');
            setWebsocket(ws);
        };
        ws.onmessage = (event) => {
            const data = JSON.parse(event.data) as ChatMessage;
            console.log('websocket message', data);

            setHistory([...history(), data]);
        };
        ws.onclose = () => {
            console.log('websocket closed');
            setWebsocket(null);
            setTimeout(connect, 1000);
        };
    };

    onMount(() => {
        connect();
    });

    onCleanup(() => {
        const ws = websocket();
        if (ws) {
            console.log('closing websocket');
            ws.close();
        }
    });

    return [history];
}

function ChatMessageComponent(props: { message: ChatMessage; showDelete: boolean }) {
    const loading = useContext(LoadingContext);
    return (
        <div class="flex justify-between">
            <div>
                <strong>{props.message.displayname}:</strong> {props.message.message}
            </div>
            <Show when={props.showDelete}>
                <DeleteButton
                    callback={() =>
                        withQuery(
                            () => actions.chat.delete({ id: props.message.id }),
                            loading,
                            false,
                            () => location.reload()
                        )
                    }
                    id={props.message.id}
                />
            </Show>
        </div>
    );
}

export interface Props {
    showDelete: boolean;
}

function Wrapped(props: Props) {
    const [staticHistory] = createQuery(() => actions.chat.loadLatest({ limit: 50 }).then((res) => res.data));
    const [history] = createSubscription();
    const [messageInput, setMessageInput] = createSignal('');
    const loading = useContext(LoadingContext);
    const [displayname, setDisplayname] = createSignal(localStorage.getItem('displayname') || 'Anonymous');

    const onMessageSend = () => {
        withQuery(() => actions.chat.publish({ message: messageInput(), displayname: displayname() }), loading, true);
        setMessageInput('');
    };

    return (
        <div class="center">
            <div class="max-h-[80vh] w-full overflow-y-auto rounded-xl bg-neutral-800 p-4 text-white">
                <input
                    value={displayname()}
                    class="mb-4 w-1/4 rounded-xl bg-neutral-600 p-2 text-white"
                    type="text"
                    autocomplete="off"
                    autocapitalize="off"
                    onChange={(e) => {
                        setDisplayname(e.currentTarget.value);
                        localStorage.setItem('displayname', e.currentTarget.value);
                    }}
                ></input>
                <input
                    value={messageInput()}
                    class="mb-8 w-3/4 rounded-xl bg-neutral-600 p-2 text-white"
                    type="text"
                    autocomplete="off"
                    autocapitalize="off"
                    onKeyDown={(e) => {
                        setMessageInput(e.currentTarget.value);
                        if (e.key == 'Enter') {
                            onMessageSend();
                        }
                    }}
                ></input>

                {history()
                    .toReversed()
                    .map((message) => (
                        <ChatMessageComponent message={message} showDelete={props.showDelete} />
                    ))}

                <Show when={staticHistory()}>
                    {staticHistory()!.map((message) => (
                        <ChatMessageComponent message={message} showDelete={props.showDelete} />
                    ))}
                </Show>
            </div>
        </div>
    );
}

export default function (props: Props) {
    return (
        <Loading initial={true}>
            <Wrapped {...props} />
        </Loading>
    );
}
