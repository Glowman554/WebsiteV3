import DeleteButton from '@glowman554/base-components/src/generic/DeleteButton';
import type { BuildToken } from '../../actions/microos';
import { withQuery } from '@glowman554/base-components/src/query/Query';
import { actions } from 'astro:actions';

export default function (props: { token: BuildToken }) {
    return (
        <DeleteButton
            callback={(id, loading) =>
                withQuery(
                    () => actions.microos.deleteBuildToken.orThrow({ token: id }),
                    loading,
                    false,
                    () => location.reload()
                )
            }
            id={props.token.token}
        />
    );
}
