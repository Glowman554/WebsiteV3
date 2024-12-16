import { createSignal, Show, useContext } from 'solid-js';
import type { Project } from '../../actions/projects';
import { actions } from 'astro:actions';
import Loading, { LoadingContext, type LoadingInterface } from '@glowman554/base-components/src/loading/Loading';
import DeleteButton from '@glowman554/base-components/src/generic/DeleteButton';
import { withQuery } from '@glowman554/base-components/src/query/Query';
import EditButton from '@glowman554/base-components/src/generic/EditButton';
import Overlay from '@glowman554/base-components/src/generic/Overlay';

export type Props =
    | {
          initial?: undefined;
          submit: (name: string, link: string, description: string, loading: LoadingInterface) => void;
      }
    | {
          initial: Project;
          submit: (name: string, link: string, description: string, loading: LoadingInterface, id: number) => void;
      };

function Wrapped(props: Props) {
    const loading = useContext(LoadingContext);
    const [name, setName] = createSignal(props.initial?.name || '');
    const [link, setLink] = createSignal(props.initial?.link || '');
    const [description, setDescription] = createSignal(props.initial?.description || '');

    const submit = () => {
        if (props.initial) {
            props.submit(name(), link(), description(), loading, props.initial.id);
        } else {
            props.submit(name(), link(), description(), loading);
        }
    };

    return (
        <form
            on:submit={(e) => {
                e.preventDefault();
                submit();
            }}
        >
            <div class="section">
                Name
                <input type="text" value={name()} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div class="section">
                Link
                <input type="text" value={link()} onChange={(e) => setLink(e.target.value)} required />
            </div>
            <div class="section">
                Description
                <input type="text" value={description()} onChange={(e) => setDescription(e.target.value)} required />
            </div>
            <div class="center">
                <button type="submit">
                    <Show when={props.initial} fallback={<>Create</>}>
                        Update
                    </Show>
                </button>
            </div>
        </form>
    );
}

export default function ProjectEditor(props: Props) {
    return (
        <Loading initial={false}>
            <div class="field">
                <Wrapped {...props} />
            </div>
        </Loading>
    );
}

export function ProjectEditorButtons(props: { project: Project }) {
    const [editVisible, setEditVisible] = createSignal(false);

    return (
        <>
            <DeleteButton
                callback={(id, loading) =>
                    withQuery(
                        () => actions.projects.delete.orThrow({ id }),
                        loading,
                        false,
                        () => location.reload()
                    )
                }
                id={props.project.id}
            />
            <EditButton callback={() => setEditVisible(true)} />
            <Overlay visible={editVisible()}>
                <ProjectEditor
                    initial={props.project}
                    submit={(name, link, description, loading, id) =>
                        withQuery(
                            () => actions.projects.update.orThrow({ name, link, description, id }),
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
