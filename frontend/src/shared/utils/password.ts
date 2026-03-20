export const togglePasswordVisibility = (
    state: boolean,
    setter: (value: boolean) => void
) => setter(!state);