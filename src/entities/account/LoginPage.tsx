import {FC, memo} from 'react';

import {Link} from 'react-router-dom';

import {AuthFormWrapper, FullSize} from '../../components/containers';
import {PageProps} from '../../router/types';

import LoginForm from './LoginForm';

const LoginPage: FC<PageProps> = memo(() => {
    return (
        <FullSize>
            <AuthFormWrapper>
                <LoginForm />

                <div>
                    Нет аккаунта?&nbsp;
                    <Link to="/register">Зарегистрироваться</Link>
                </div>
            </AuthFormWrapper>
        </FullSize>
    );
});

export default LoginPage;
