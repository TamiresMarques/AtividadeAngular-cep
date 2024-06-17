import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule,  AbstractControl,FormControl } from '@angular/forms';
import { EnderecoService } from '../services/endereco.service';
import { Endereco } from '../models/endereco';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-formulario',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './formulario.component.html',
  styleUrl: './formulario.component.css'
})
export class FormularioComponent {
  formAngular: FormGroup = new FormGroup({});
  cep: string = '';

  constructor(
    private fBuilder: FormBuilder, // Injeta o serviço FormBuilder para construir o formulário
    private enderecoService: EnderecoService // Injeta o serviço EnderecoService para buscar dados de endereço
  ) {
      this.formAngular = this.fBuilder.group({
        nomeCompleto: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(210)]],
        nascimento: ['', [Validators.required, this.validarNascimento]],
        email: ['', [Validators.required, Validators.email]],
        telefone: ['', [Validators.required, Validators.pattern(/^\d{10,11}$/)]],
        cpf: ['', [Validators.required, Validators.pattern(/^\d{11}$/), , this.validarCpf]],
        cep: ['', [Validators.required]],
        logradouro: ['', Validators.required],
        numero: ['', Validators.required],
        complemento: [''],
        bairro: ['', Validators.required],
        cidade: ['', Validators.required],
        uf: ['', [Validators.required, Validators.pattern(/^[A-Z]{2}$/)]],
      });
    }

  validarForm() {
    if (this.formAngular.valid) {
      console.log(this.formAngular.value); // Se o formulário for válido, exibe os valores no console
    } else {
      console.log("Formulário inválido"); // Se o formulário for inválido, exibe mensagem no console
    }
  }

  private validarNascimento(control: AbstractControl): { [key: string]: boolean } | null {
    let valor = control.value;
    valor = valor.replace(/[^\d]+/g, '');

    const regex = /^\d{8}$/;
    // Verifica se a data está no formato esperado
    if (valor && !regex.test(valor)) {
      return { 'invalidDate': true };
    }

    const dia = Number(valor.substr(0, 2));
    const mes = Number(valor.substr(2, 2));
    const ano = Number(valor.substr(4, 4));

    // Verifica se a data é válida
    const data = new Date(ano, mes - 1, dia);

    if (isNaN(data.getTime()) || data.getDate() !== dia || data.getMonth() + 1 !== mes || data.getFullYear() !== ano) {
      return { 'invalidDate': true };
    }
    return null;
  }

  private validarCpf(control: AbstractControl): { [key: string]: boolean } | null {
    let cpf = control.value;
    cpf = cpf.replace(/[^\d]+/g, ''); // Remove caracteres não numéricos

    // Verifica se o CPF tem 11 dígitos ou se é uma sequência inválida
    if (cpf.length !== 11 || cpf === '00000000000' || cpf === '11111111111' || cpf === '22222222222' || cpf === '33333333333' || cpf === '44444444444' ||
      cpf === '55555555555' || cpf === '66666666666' || cpf === '77777777777' || cpf === '88888888888' || cpf === '99999999999') {
      return { 'invalidCPF': true };
    }
    return null;
  }


  gerarEndereco() {
    const formulario = this.formAngular;
    if (formulario) {
      const cep= formulario.get('cep')?.value;
      if (cep && cep.length === 8) {
        this.enderecoService.getEndereco(cep).then((endereco: Endereco) => {
            this.formAngular.patchValue({
              rua: endereco.logradouro,
              bairro: endereco.bairro,
              cidade: endereco.cidade,
              estado: endereco.uf
            });
          })
      } else {
        console.error('CEP não encontrado no formulário.'); // Exibe erro no console se o controle CEP não for encontrado
      }
    } else {
      console.error('Formulário não encontrado.'); // Exibe erro no console se o formulário não for encontrado
    }
  }

  validarCampos(fGroup: FormGroup) {
    // Função recursiva para marcar todos os campos do formulário como tocados
    Object.keys(fGroup.controls).forEach(field => {
      const control = fGroup.get(field);
      if (control instanceof FormControl) {
        control.markAsTouched({ onlySelf: true });
      } else if (control instanceof FormGroup) {
        this.validarCampos(control);
      }
    });
  }

  enviarFormulario() {
    if (this.formAngular.valid) {
      console.log('Formulário enviado com sucesso!');
      this.formAngular.reset();
    } else {
      Object.keys(this.formAngular.controls).forEach(field => {
        const control = this.formAngular.get(field);
        if (control) {
          control.markAsTouched({ onlySelf: true });
        }
      });
    }
  }
}
