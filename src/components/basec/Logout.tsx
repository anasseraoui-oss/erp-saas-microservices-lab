import authService from "../../api/authService";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const Logout = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const performLogout = async () => {
            try {
                // Wait for the logout process to complete
                await authService.logout();
                // Redirect to the login page
                navigate('/login');
            } catch (error) {
                console.error("Error during logout:", error);
            }
        };

        performLogout();
    }, [navigate]);

    return <p>Logging out...</p>;
};

export default Logout;
