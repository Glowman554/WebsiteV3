import { Show, useContext } from 'solid-js';
import type { User } from '../../actions/authentication';
import { actions } from 'astro:actions';
import LoginEditor from './LoginEditor';
import { QueryContext } from '@glowman554/base-components/src/query/QueryController';
import Query, { withQuery } from '@glowman554/base-components/src/query/Query';
import Overlay from '@glowman554/base-components/src/generic/Overlay';

export interface Props {
    check: (u: User) => boolean;
}

export default function (props: Props) {
    const query = useContext(QueryContext);

    return (
        <Query f={() => actions.authentication.status.orThrow()} queryKey="internal-status">
            {(user) => (
                <Overlay visible={!(user && props.check(user))} reset={() => {}}>
                    <div class="field">
                        <p>You can't access this page</p>
                        <Show when={!user}>
                            <LoginEditor
                                submit={(username, password, loading) =>
                                    withQuery(
                                        () =>
                                            actions.authentication.login.orThrow({
                                                username,
                                                password,
                                            }),
                                        loading,
                                        false,
                                        () => {
                                            query.refetch('internal-status');
                                        }
                                    )
                                }
                            />
                        </Show>
                    </div>
                </Overlay>
            )}
        </Query>
    );
}
