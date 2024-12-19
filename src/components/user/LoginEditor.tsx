import Loading, { LoadingContext, type LoadingInterface } from '@glowman554/base-components/src/loading/Loading';
import { createSignal, useContext } from 'solid-js';

export interface Props {
    submit: (username: string, password: string, loading: LoadingInterface) => void;
}

function Wrapped(props: Props) {
    const loading = useContext(LoadingContext);
    const [email, setEmail] = createSignal('');
    const [password, setPassword] = createSignal('');

    const submit = () => {
        props.submit(email(), password(), loading);
    };

    return (
        <form
            on:submit={(e) => {
                e.preventDefault();
                submit();
            }}
        >
            <table>
                <tbody>
                    <tr>
                        <td class="text-nowrap pr-2">Username</td>
                        <td class="w-full">
                            <input
                                type="text"
                                class="w-full"
                                onChange={(e) => setEmail(e.target.value)}
                                value={email()}
                                required
                            />
                        </td>
                    </tr>
                    <tr>
                        <td class="text-nowrap pr-2"> Password</td>
                        <td class="w-full">
                            <input
                                type="password"
                                class="w-full"
                                onChange={(e) => setPassword(e.target.value)}
                                value={password()}
                                required
                            />
                        </td>
                    </tr>
                </tbody>
            </table>
            <br />
            <div class="center">
                <button class="button" type="submit">
                    Login
                </button>
            </div>
        </form>
    );
}

export default function (props: Props) {
    return (
        <Loading initial={false}>
            <Wrapped {...props} />
        </Loading>
    );
}
