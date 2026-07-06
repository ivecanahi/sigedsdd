class CredencialesInvalidasError(Exception):
    """Excepción lanzada cuando las credenciales proporcionadas no son válidas."""

    pass


class CuentaInactivaError(Exception):
    """Excepción lanzada cuando el usuario intenta iniciar sesión pero su cuenta está inactiva."""

    pass
