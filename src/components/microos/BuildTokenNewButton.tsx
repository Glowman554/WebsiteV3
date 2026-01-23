import { createSignal, useContext } from 'solid-js';
import { actions } from 'astro:actions';
import Overlay from '@glowman554/base-components/src/generic/Overlay';
import { withQuery } from '@glowman554/base-components/src/query/Query';
import { LoadingContext } from '@glowman554/base-components/src/loading/Loading';

export default function () {
    const loading = useContext(LoadingContext);

    return (
        <>
            <button
                class="button"
                onClick={() =>
                    withQuery(
                        () => actions.microos.createBuildToken.orThrow(),
                        loading,
                        false,
                        () => location.reload()
                    )
                }
            >
                New build token
            </button>
        </>
    );
}
