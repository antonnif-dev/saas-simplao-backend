export class BaseService {
  constructor() {
    // Lógica comum de serviços pode vir aqui
  }
  
  protected handleError(error: any) {
    throw new Error(error.message || 'Service Error');
  }
}