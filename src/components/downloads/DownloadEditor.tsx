import { createSignal, Show, useContext } from 'solid-js';
import type { Download } from '../../actions/downloads';
import Loading, { LoadingContext, type LoadingInterface } from '@glowman554/base-components/src/loading/Loading';
import UploadButton from '../UploadButton';
import { withQuery } from '@glowman554/base-components/src/query/Query';
import Overlay from '@glowman554/base-components/src/generic/Overlay';
import DeleteButton from '@glowman554/base-components/src/generic/DeleteButton';
import EditButton from '@glowman554/base-components/src/generic/EditButton';
import { actions } from 'astro:actions';

export type Props =
    | {
          initial?: undefined;
          submit: (name: string, link: string, loading: LoadingInterface) => void;
      }
    | {
          initial: Download;
          submit: (name: string, link: string, loading: LoadingInterface, id: number) => void;
      };

function Wrapped(props: Props) {
    const loading = useContext(LoadingContext);
    const [name, setName] = createSignal(props.initial?.name || '');
    const [link, setLink] = createSignal(props.initial?.link || '');

    const submit = () => {
        if (props.initial) {
            props.submit(name(), link(), loading, props.initial.id);
        } else {
            props.submit(name(), link(), loading);
        }
    };

    return (
        <form
            on:submit={(e) => {
                e.preventDefault();
                submit();
            }}
        >
            <table>
                <tbody>
                    <tr>
                        <td class="text-nowrap pr-2">Name</td>
                        <td class="w-full">
                            <input
                                type="text"
                                class="input w-full"
                                value={name()}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </td>
                    </tr>
                    <tr>
                        <td class="text-nowrap pr-2">Link</td>
                        <td class="w-full">
                            <input
                                type="text"
                                class="input w-full"
                                value={link()}
                                onChange={(e) => setLink(e.target.value)}
                                required
                            />
                        </td>
                    </tr>
                </tbody>
            </table>

            <br />

            <div class="center">
                <button class="button" type="submit">
                    <Show when={props.initial} fallback={<>Create</>}>
                        Update
                    </Show>
                </button>
                <UploadButton callback={setLink} />
            </div>
        </form>
    );
}

export default function DownloadEditor(props: Props) {
    return (
        <Loading initial={false}>
            <div class="field">
                <Wrapped {...props} />
            </div>
        </Loading>
    );
}

export function DownloadEditorButtons(props: { download: Download }) {
    const [editVisible, setEditVisible] = createSignal(false);

    return (
        <>
            <DeleteButton
                callback={(id, loading) =>
                    withQuery(
                        () => actions.downloads.delete.orThrow({ id }),
                        loading,
                        false,
                        () => location.reload()
                    )
                }
                id={props.download.id}
            />
            <EditButton callback={() => setEditVisible(true)} />
            <Overlay visible={editVisible()}>
                <DownloadEditor
                    initial={props.download}
                    submit={(name, link, loading, id) =>
                        withQuery(
                            () => actions.downloads.update.orThrow({ name, link, id }),
                            loading,
                            false,
                            () => location.reload()
                        )
                    }
                />
            </Overlay>
        </>
    );
}
