import { createEffect, createSignal, Show, useContext } from 'solid-js';
import { passwordOk, validatePassword, type PasswordResult } from '../../shared/password';
import Loading, { LoadingContext, type LoadingInterface } from '@glowman554/base-components/src/loading/Loading';

export interface Props {
    submit: (oldPassword: string, newPassword: string, loading: LoadingInterface) => void;
}

function PasswordValidationResult(props: PasswordResult) {
    return (
        <>
            <p>Password must contain:</p>
            <p style={{ color: props.length ? 'green' : 'red' }}>At least 8 characters</p>
            <p style={{ color: props.upperCase ? 'green' : 'red' }}>At least one upper case character</p>
            <p style={{ color: props.specialChar ? 'green' : 'red' }}>At least one special character</p>
        </>
    );
}

function Wrapped(props: Props) {
    const loading = useContext(LoadingContext);

    const [oldPassword, setOldPassword] = createSignal('');
    const [newPassword, setNewPassword] = createSignal('');
    const [newPasswordControl, setNewPasswordControl] = createSignal('');

    const [passwordResult, setPasswordResult] = createSignal<PasswordResult>({
        length: false,
        specialChar: false,
        upperCase: false,
    });
    createEffect(() => {
        setPasswordResult(validatePassword(newPassword()));
    });

    const submit = () => {
        if (newPassword() != newPasswordControl()) {
            return;
        }

        props.submit(oldPassword(), newPassword(), loading);
    };

    return (
        <form
            on:submit={(e) => {
                e.preventDefault();
                submit();
            }}
        >
            <div class="section">
                Old password
                <input
                    type="password"
                    value={oldPassword()}
                    onChange={(e) => setOldPassword(e.target.value)}
                    required
                />
            </div>

            <div class="section">
                New password
                <input type="password" value={newPassword()} onInput={(e) => setNewPassword(e.target.value)} required />
            </div>

            <div class="section">
                Repeat new password
                <input
                    type="password"
                    value={newPasswordControl()}
                    onInput={(e) => setNewPasswordControl(e.target.value)}
                    required
                />
            </div>

            <Show when={!passwordOk(passwordResult())}>
                <PasswordValidationResult {...passwordResult()} />
            </Show>
            <br />
            <Show when={newPassword() != newPasswordControl()}>
                <p style={{ color: 'red' }}>Passwords do not match</p>
            </Show>

            <div class="center">
                <button type="submit" disabled={!passwordOk(passwordResult()) || newPassword() != newPasswordControl()}>
                    Change
                </button>
            </div>
        </form>
    );
}

export default function (props: Props) {
    return (
        <Loading initial={false}>
            <div class="field">
                <Wrapped {...props} />
            </div>
        </Loading>
    );
}
