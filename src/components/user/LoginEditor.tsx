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
            <div class="section">
                Username
                <input type="text" onChange={(e) => setEmail(e.target.value)} value={email()} required />
            </div>
            <div class="section">
                Password
                <input type="password" onChange={(e) => setPassword(e.target.value)} value={password()} required />
            </div>
            <div class="center">
                <button type="submit">Login</button>
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
