import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Codigos } from "src/entities/codigos.entity";
import { Repository } from "typeorm";

@Injectable()
export class CodigosService {
  constructor(
    @InjectRepository(Codigos)
    private codigosRepo: Repository<Codigos>,
  ) {}

  encontrarCodigo = async (codigoBuscado) => {
    //si se llama el codigo con puntos, se quitan
    codigoBuscado = codigoBuscado.replace(".", "");
    //se llama a la funcion que recupera todos los codigos
    const codigos = await this.codigosRepo.find();
    //se comparan los elementos para buscarlos
    const codigoEncontrado = codigos.find(
      (element) => element.codigo === codigoBuscado, //esto determina que la coincidencia debe ser exacta
    );
    //si no lo encuentra no es comges
    if (!codigoEncontrado)
      return {
        error: "El codigo no es comges (no coinciden caracteres principales)",
      };

    return codigoEncontrado;
  };

  obtenerCodigos = async () => {
    const codigos = await this.codigosRepo.find();
    return {
      title: "Todos los codigos comges 11.1",
      res: codigos,
    };
  };

  obtenerProgramaDeCodigo = async (codigo) => {
    const codigoEncontrado: any = await this.encontrarCodigo(codigo);

    if (!codigoEncontrado.error) {
      return {
        programa: codigoEncontrado.programa,
      };
    } else {
      return {
        error: "Codigo no encontrado",
      };
    }
  };
}
