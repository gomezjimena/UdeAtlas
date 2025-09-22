"""Modelo de Usuario"""

from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.db import Base

class Usuario(Base):
    __tablename__ = "tbl_Usuario"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, nullable=False)
    documento = Column(String, unique=True, index=True, nullable=False)
    correo = Column(String, unique=True, index=True, nullable=False)
    id_tipo_documento = Column(Integer, ForeignKey("tbl_Tipo_Documento.id"), nullable=False)
    id_rol = Column(Integer, ForeignKey("tbl_Rol.id"), nullable=False)

    # Relaciones (por ahora las dejamos simples, se expanden luego)
    rol = relationship("Rol", back_populates="usuarios")
    tipoDocumento = relationship("TipoDocumento", back_populates="usuarios")
    comentarios = relationship("Comentario", back_populates="usuario")
    eventos = relationship("Evento", back_populates="usuario")
    favoritos = relationship("Favorito", back_populates="usuario") 