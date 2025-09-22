"""Esquemas de Pydantic para el modelo Usuario"""

from pydantic import BaseModel, EmailStr

class UsuarioBase(BaseModel):
    nombre: str
    documento: str
    correo: EmailStr
    id_tipo_documento: int
    id_rol: int


# Para crear usuario (lo que espera la API al recibir datos)
class UsuarioCrear(UsuarioBase):
    pass


# Para leer usuario (lo que devuelve la API al frontend)
class UsuarioRespuesta(UsuarioBase):
    id: int

    class Config:
        from_attributes = True  # importante para trabajar con SQLAlchemy
