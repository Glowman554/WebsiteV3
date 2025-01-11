import { useContext } from 'solid-js';
import Loading, { LoadingContext } from '@glowman554/base-components/src/loading/Loading';
import { actions } from 'astro:actions';

export interface Props {
    callback: (url: string) => void;
}

function Wrapped(props: Props) {
    const loading = useContext(LoadingContext);
    let fileInput: HTMLInputElement | undefined;

    const handleFileChange = async () => {
        const files = fileInput?.files;
        if (!files) {
            return;
        }

        loading.setLoading(true);
        try {
            for (let i = 0; i < files.length; i++) {
                const file = files.item(i)!;
                const prepared = await actions.uploads.prepare.orThrow({ name: file.name });

                const xhr = new XMLHttpRequest();
                const success = await new Promise<boolean>((resolve) => {
                    xhr.upload.addEventListener('progress', (event) => {
                        if (event.lengthComputable) {
                            loading.setProgress((event.loaded / event.total) * 100);
                        }
                    });
                    0;
                    xhr.addEventListener('loadend', () => {
                        resolve(xhr.readyState == 4 && xhr.status == 200);
                    });
                    xhr.open('POST', prepared.url, true);
                    xhr.setRequestHeader('Authentication', prepared.uploadToken);
                    xhr.send(file);
                });
                if (!success) {
                    throw new Error('Failed to upload file');
                }

                props.callback(prepared.url);
            }
        } catch (e) {
            loading.setError(String(e));
        } finally {
            loading.setLoading(false);
        }
    };
    return (
        <>
            <button class="button" type="button" onClick={() => fileInput?.click()}>
                Upload
            </button>
            <input type="file" ref={fileInput} class="hidden" onInput={handleFileChange} />
        </>
    );
}

export default function (props: Props) {
    return (
        <Loading initial={false} progressBar={true}>
            <Wrapped {...props} />
        </Loading>
    );
}
