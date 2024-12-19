import { createSignal, Show, useContext } from 'solid-js';
import type { PartialPost, Post } from '../../actions/posts';
import UploadButton from '../UploadButton';
import TextGenerator from '../ai/TextGenerator';
import ImageGenerator from '../ai/ImageGenerator';
import { actions } from 'astro:actions';
import Loading, { LoadingContext, type LoadingInterface } from '@glowman554/base-components/src/loading/Loading';
import Overlay from '@glowman554/base-components/src/generic/Overlay';
import DeleteButton from '@glowman554/base-components/src/generic/DeleteButton';
import Query, { withQuery } from '@glowman554/base-components/src/query/Query';
import EditButton from '@glowman554/base-components/src/generic/EditButton';

export type Props =
    | {
          initial?: undefined;
          submit: (title: string, content: string, loading: LoadingInterface) => void;
      }
    | {
          initial: Post;
          submit: (title: string, content: string, loading: LoadingInterface, id: number) => void;
      };

function Wrapped(props: Props) {
    const loading = useContext(LoadingContext);
    const [title, setTitle] = createSignal(props.initial?.title || '');
    const [content, setContent] = createSignal(props.initial?.content || '');

    const [textGeneratorVisible, setTextGeneratorVisible] = createSignal(false);
    const [imageGeneratorVisible, setImageGeneratorVisible] = createSignal(false);

    const submit = () => {
        if (props.initial) {
            props.submit(title(), content(), loading, props.initial.id);
        } else {
            props.submit(title(), content(), loading);
        }
    };

    return (
        <>
            <form
                on:submit={(e) => {
                    e.preventDefault();
                    submit();
                }}
            >
                <div class="flex flex-col rounded-xl bg-slate-300 p-2">
                    <input
                        class="mb-2 rounded-xl border-none p-2"
                        type="text"
                        value={title()}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                    />

                    <textarea
                        class="mb-2 h-[50vh] resize-none rounded-xl border-none p-2"
                        value={content()}
                        onChange={(e) => setContent(e.target.value)}
                        required
                    />

                    <div class="center">
                        <button class="button" type="submit">
                            <Show when={props.initial} fallback={<>Create</>}>
                                Update
                            </Show>
                        </button>
                        <button class="button" type="button" onClick={() => setTextGeneratorVisible(true)}>
                            Generate text
                        </button>
                        <button class="button" type="button" onClick={() => setImageGeneratorVisible(true)}>
                            Generate image
                        </button>
                        <UploadButton callback={(url) => setContent(content() + '\n' + `![image](${url})`)} />
                    </div>
                </div>
            </form>
            <Overlay visible={textGeneratorVisible()}>
                <TextGenerator
                    callback={(text) => {
                        setContent(text);
                        setTextGeneratorVisible(false);
                    }}
                    system="You are an AI assistant generating technical blog posts written in markdown. You should not use anything that is not included in standard markdown."
                />
            </Overlay>
            <Overlay visible={imageGeneratorVisible()}>
                <ImageGenerator
                    callback={(url) => {
                        setContent(content() + '\n' + `![image](${url})`);
                        setImageGeneratorVisible(false);
                    }}
                />
            </Overlay>
        </>
    );
}

export default function PostEditor(props: Props) {
    return (
        <Loading initial={false}>
            <Wrapped {...props} />
        </Loading>
    );
}

export function PostEditorButtons(props: { post: PartialPost }) {
    const [editVisible, setEditVisible] = createSignal(false);

    return (
        <>
            <DeleteButton
                callback={(id, loading) =>
                    withQuery(
                        () => actions.posts.delete.orThrow({ id }),
                        loading,
                        false,
                        () => location.reload()
                    )
                }
                id={props.post.id}
            />
            <EditButton callback={() => setEditVisible(true)} />
            <Overlay visible={editVisible()}>
                <Query f={() => actions.posts.load.orThrow({ id: props.post.id })}>
                    {(post) => (
                        <PostEditor
                            initial={post}
                            submit={(title, content, loading, id) =>
                                withQuery(
                                    () => actions.posts.update.orThrow({ title, content, id }),
                                    loading,
                                    false,
                                    () => location.reload()
                                )
                            }
                        />
                    )}
                </Query>
            </Overlay>
        </>
    );
}
