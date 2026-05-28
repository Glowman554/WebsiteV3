import { createSignal, Show, useContext } from 'solid-js';
import type { Avatar } from '../../actions/avatars';
import Loading, { LoadingContext, type LoadingInterface } from '@glowman554/base-components/src/loading/Loading';
import { withQuery } from '@glowman554/base-components/src/query/Query';
import Overlay from '@glowman554/base-components/src/generic/Overlay';
import DeleteButton from '@glowman554/base-components/src/generic/DeleteButton';
import EditButton from '@glowman554/base-components/src/generic/EditButton';
import { actions } from 'astro:actions';
import UploadButton from '../UploadButton';

export type Props =
    | {
          initial?: undefined;
          submit: (name: string, modelUrl: string, configuration: string, loading: LoadingInterface) => void;
      }
    | {
          initial: Avatar;
          submit: (
              name: string,
              modelUrl: string,
              configuration: string,
              loading: LoadingInterface,
              id: number
          ) => void;
      };

function Wrapped(props: Props) {
    const loading = useContext(LoadingContext);
    const [name, setName] = createSignal(props.initial?.name || '');
    const [modelUrl, setModelUrl] = createSignal(props.initial?.modelUrl || '');
    const [configuration, setConfiguration] = createSignal(props.initial?.configuration || '');

    const submit = () => {
        if (props.initial) {
            props.submit(name(), modelUrl(), configuration(), loading, props.initial.id);
        } else {
            props.submit(name(), modelUrl(), configuration(), loading);
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
                        <td class="pr-2 text-nowrap">Name</td>
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
                        <td class="pr-2 text-nowrap">Model URL</td>
                        <td class="w-full">
                            <input
                                type="text"
                                class="input w-full"
                                value={modelUrl()}
                                onChange={(e) => setModelUrl(e.target.value)}
                                required
                            />
                        </td>
                    </tr>
                    <tr>
                        <td class="pr-2 align-top text-nowrap">Configuration</td>
                        <td class="w-full">
                            <textarea
                                class="input h-40 w-full resize-none"
                                value={configuration()}
                                onChange={(e) => setConfiguration(e.target.value)}
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
                <UploadButton callback={(url) => setModelUrl(url)} />
            </div>
        </form>
    );
}

export default function AvatarEditor(props: Props) {
    return (
        <Loading initial={false}>
            <div class="field">
                <Wrapped {...props} />
            </div>
        </Loading>
    );
}

export function AvatarEditorButtons(props: { avatar: Avatar }) {
    const [editVisible, setEditVisible] = createSignal(false);

    return (
        <>
            <DeleteButton
                callback={(id, loading) =>
                    withQuery(
                        () => actions.avatars.delete.orThrow({ id }),
                        loading,
                        false,
                        () => location.reload()
                    )
                }
                id={props.avatar.id}
            />
            <EditButton callback={() => setEditVisible(true)} />
            <Overlay visible={editVisible()} reset={() => setEditVisible(false)}>
                <AvatarEditor
                    initial={props.avatar}
                    submit={(name, modelUrl, configuration, loading, id) =>
                        withQuery(
                            () => actions.avatars.update.orThrow({ name, modelUrl, configuration, id }),
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
