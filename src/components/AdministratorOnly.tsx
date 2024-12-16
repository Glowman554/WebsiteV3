import QueryController from '@glowman554/base-components/src/query/QueryController';
import Internal from './user/Internal';

export default function () {
    return (
        <QueryController>
            <Internal check={(u) => u.administrator} />
        </QueryController>
    );
}
