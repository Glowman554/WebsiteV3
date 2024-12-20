import Overlay from '@glowman554/base-components/src/generic/Overlay';
import { createSignal } from 'solid-js';
import PasswordChangeEditor from './PasswordChangeEditor';
import { withQuery } from '@glowman554/base-components/src/query/Query';
import { actions } from 'astro:actions';
import Loading from '@glowman554/base-components/src/loading/Loading';

function Wrapped() {
    const [changePasswordVisible, setChangePasswordVisible] = createSignal(false);

    return (
        <>
            <button class="button" onClick={() => setChangePasswordVisible(true)}>
                Change password
            </button>

            <Overlay visible={changePasswordVisible()}>
                <PasswordChangeEditor
                    submit={(oldPassword, newPassword, loading) =>
                        withQuery(
                            () => actions.authentication.changePassword.orThrow({ oldPassword, newPassword }),
                            loading,
                            false,
                            () => {
                                location.reload();
                            }
                        )
                    }
                />
            </Overlay>
        </>
    );
}

export default function () {
    return (
        <Loading initial={false}>
            <Wrapped />
        </Loading>
    );
}
