import { useContext } from 'solid-js';
import type { UploadResult } from '../actions/uploads';
import Loading, { LoadingContext } from '@glowman554/base-components/src/loading/Loading';

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
                const res = await fetch('/api/upload/' + file.name, {
                    method: 'POST',
                    body: file,
                });
                const json = (await res.json()) as UploadResult;
                props.callback(json.url);
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
        <Loading initial={false}>
            <Wrapped {...props} />
        </Loading>
    );
}
