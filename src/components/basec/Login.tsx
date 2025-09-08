import React, {useState} from 'react';
import { useNavigate } from 'react-router-dom';
import authService from "../../api/authService";
import "../../Css/account/login.css"
    function Login() {
    const [credentials, setCredentials] = useState({ email: '', password: '' });
    const navigate = useNavigate();
    const handleChange = (e: { target: { name: any; value: any; }; }) => {
        setCredentials({
            ...credentials,
            [e.target.name]: e.target.value
        });
    };

        const handleSubmit = async (e: { preventDefault: () => void; }) => {
            e.preventDefault();
            try {
                console.log(credentials);
                // @ts-ignore
                const response =await authService.login(credentials);
                if (response && response.token) {
                    console.log("Login successful");
                    navigate('/');
                }
            } catch (error) {
                console.error("Login failed:", error);
            }
        };
    // @ts-ignore
        return (
        <div className="login-container">
            <h2>Login</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="email"
                    name="email"
                    placeholder="email"
                    value={credentials.email}
                    onChange={handleChange}
                    required
                />
                <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={credentials.password}
                    onChange={handleChange}
                    required
                />
                <button type="submit">Login</button>
            </form>
        </div>
    );
}

export default Login;
