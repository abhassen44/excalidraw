import { AuthPage } from "../components/AuthPage";

export default function Signup() {
    return (
        <div>
            <AuthPage isSigningIn={false}></AuthPage>
        </div>
    );
}