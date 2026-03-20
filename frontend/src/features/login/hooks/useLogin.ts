import { togglePasswordVisibility } from "@/shared/utils";
import { useState } from "react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useNavigate } from "react-router";
import { toast } from "sonner";

export const useLogin = () => {
    const navigate = useNavigate();
    const { useLoginMutation } = useAuth();
    
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState<{
        email?: string;
        password?: string;
    }>({});

    const validateEmail = (value: string) => {
        if (!value) return "El email es requerido";
        if (!/\S+@\S+\.\S+/.test(value)) return "Por favor, introduce una dirección de email válida";
        return undefined;
    };
    const validatePassword = (value: string) => {
        if (!value) return "La contraseña es requerida";
        if (value.length < 8) return "La contraseña debe tener al menos 8 caracteres";
        return undefined;
    };
    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setEmail(value);
        const error = validateEmail(value);
        setErrors(prev => ({ ...prev, email: error }));
    };
    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setPassword(value);
        const error = validatePassword(value);
        setErrors(prev => ({ ...prev, password: error }));
    };
    const togglePassword = () => togglePasswordVisibility(showPassword, setShowPassword);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const passwordError = validatePassword(password);

        if (passwordError) {
            setErrors({ password: passwordError });
            return;
        }

        const emailError = validateEmail(email);
        if (emailError) {
            setErrors({ email: emailError });
            return;
        }

        useLoginMutation.mutate(
            {
                email,
                password,
            },
            {
                onSuccess: () => {
                    toast.success("Bienvenido de nuevo!");
                    navigate("/admin/dashboard");
                },
            }
        );
    };

    return {
        email,
        password,
        showPassword,
        errors,
        isLoading: useLoginMutation.isPending,
        handleEmailChange,
        handlePasswordChange,
        togglePassword,
        handleSubmit,
    };
};