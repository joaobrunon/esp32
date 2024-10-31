#include <Arduino.h>
#include <WiFi.h>
#include <WebServer.h>
#include <NTPClient.h>
#include <WiFiUdp.h>
#include <EEPROM.h>  // Biblioteca para manipular EEPROM
#include <WiFiClientSecure.h>
#include <HTTPClient.h>


// Configurações de Wi-Fi
const char* ssid = "joao bruno";
const char* password = "bruno1234";

// Configurações NTP
const char* ntpServer = "pool.ntp.org";
const long utcOffsetInSeconds = -3 * 3600;  // UTC-3 para o Brasil

// Configuração do pino do relé
const int relePin = 23;
int duracaoSirene = 5;  // Duração padrão em segundos
int totalHorarios = 0;
// Estrutura para armazenar horários
struct Horario {
  int diaSemana;
  int hora;
  int minuto;
};
Horario horarios[64];


// Controle do servidor web e NTP
WebServer server(8080);
WiFiUDP ntpUDP;
NTPClient timeClient(ntpUDP, ntpServer, utcOffsetInSeconds);

// Variáveis de controle
bool relogioAtivo = true;
int ultimoMinuto = -1;
String logsWeb = "";

// Configuração inicial
void setup();
void loop();
void configurarRotas();
void handleRoot();
void handleLogs();
void handleTestarSirene();
void handleAdicionarHorario();
void handleLimparHorarios();
void handleConfigurarDuracao();
void handleAtualizarHorario();
void handleAtivarRelogio();
void handleDesativarRelogio();
void verificarHorarios();
void acionarSirene();
void salvarHorarios();   // Declaração da função salvarHorarios
void carregarHorarios(); // Declaração da função carregarHorarios
void setup() {
  Serial.begin(9600);
  EEPROM.begin(sizeof(totalHorarios) + sizeof(horarios) + sizeof(duracaoSirene));  // Inicializa EEPROM
  carregarHorarios();  // Carrega os horários salvos na EEPROM

  
  // Conectar ao Wi-Fi
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWi-Fi conectado!");
  logsWeb += "Wi-Fi conectado.<br>";

  // Iniciar cliente NTP e servidor web
  timeClient.begin();
  timeClient.update();

  pinMode(relePin, OUTPUT);
  digitalWrite(relePin, LOW);

  configurarRotas();
  server.begin();
  Serial.println("Servidor iniciado na porta 8080.");
  logsWeb += "Servidor iniciado na porta 8080.<br>";

// Definindo horários fixos (exemplo)



  Serial.println("Horários programados:");
  for (int i = 0; i < totalHorarios; i++) {
    Serial.printf("Dia %d - %02d:%02d\n", horarios[i].diaSemana, horarios[i].hora, horarios[i].minuto);
  
 }
 }

// Loop principal
void loop() {
  server.handleClient();
  if (relogioAtivo) {
    timeClient.update();
    verificarHorarios();
  }
}

// Configuração das rotas do servidor web
void configurarRotas() {
  server.on("/", handleRoot);
  server.on("/testar", handleTestarSirene);
  server.on("/adicionarHorario", handleAdicionarHorario);
  server.on("/limparHorarios", handleLimparHorarios);
  server.on("/configurarDuracao", handleConfigurarDuracao);
  server.on("/ativarRelogio", handleAtivarRelogio);
  server.on("/desativarRelogio", handleDesativarRelogio);
  server.on("/logs", handleLogs);
  server.on("/atualizarHorario", handleAtualizarHorario);
}

// Exibe a página principal
#include <time.h>  // Adicionar esta biblioteca

// Array com os nomes dos dias da semana
const char* diasSemana[] = {"Domingo", "Segunda-feira", "Terça-feira", 
                            "Quarta-feira", "Quinta-feira", "Sexta-feira", 
                            "Sábado"};

void handleRoot() {
  String pagina = "<!DOCTYPE html><html><head><meta charset='UTF-8'>";
  pagina += "<style>";
  pagina += "body { font-family: Arial, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px; }";
  pagina += ".container { max-width: 700px; margin: auto; background-color: #fff; padding: 20px; ";
  pagina += "border-radius: 10px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); }";
  pagina += "table { width: 100%; border-collapse: collapse; margin-top: 10px; }";
  pagina += "th, td { border: 1px solid #ddd; padding: 8px; text-align: center; }";
  pagina += "th { background-color: #f2f2f2; }";
  pagina += "</style></head><body>";

  pagina += "<div class='container'>";
  pagina += "<h1 style='text-align: center;'>Controle de Sirene</h1>";

  // Obter e formatar data e hora atual
  time_t agora = timeClient.getEpochTime();
  struct tm* dataHora = localtime(&agora);
  String dataFormatada = String(dataHora->tm_mday) + "/" + 
                         String(dataHora->tm_mon + 1) + "/" + 
                         String(dataHora->tm_year + 1900);
  String horaFormatada = timeClient.getFormattedTime();
  String diaSemanaAtual = diasSemana[dataHora->tm_wday];

  pagina += "<p><strong>Data Atual:</strong> " + dataFormatada + " (" + diaSemanaAtual + ")</p>";
  pagina += "<p><strong>Hora Atual:</strong> " + horaFormatada + "</p>";

  String ipAddress = WiFi.localIP().toString();
  pagina += "<p><strong>Endereço IP:</strong> " + ipAddress + "</p>";

  String estadoSistema = relogioAtivo ? "Ativado" : "Desativado";
  pagina += "<p><strong>Estado do Sistema:</strong> " + estadoSistema + "</p>";
  pagina += "<p><strong>Tempo de Duração da Sirene:</strong> " + String(duracaoSirene) + " segundos</p>";

  pagina += "<h2>Horários Programados</h2>";
  pagina += "<table><tr><th>Dia</th><th>Hora</th><th>Minuto</th></tr>";
  for (int i = 0; i < totalHorarios; i++) {
    String nomeDia = diasSemana[horarios[i].diaSemana];
    pagina += "<tr><td>" + nomeDia + "</td>";
    pagina += "<td>" + String(horarios[i].hora) + "</td>";
    pagina += "<td>" + String(horarios[i].minuto) + "</td></tr>";
  }
  pagina += "</table>";

  // Lógica melhorada para encontrar o próximo horário
  int diaAtual = dataHora->tm_wday;
  int horaAtual = dataHora->tm_hour;
  int minutoAtual = dataHora->tm_min;

  Horario* proximo = nullptr;
  int menorDiferenca = 7 * 24 * 60;  // Inicialmente, a maior diferença possível em minutos (uma semana)

  for (int i = 0; i < totalHorarios; i++) {
    int dia = horarios[i].diaSemana;
    int hora = horarios[i].hora;
    int minuto = horarios[i].minuto;

    // Calcular a diferença em minutos entre o horário atual e o horário programado
    int diferencaDias = (dia - diaAtual + 7) % 7;
    int diferencaHoras = hora - horaAtual;
    int diferencaMinutos = minuto - minutoAtual;

    int diferencaTotal = diferencaDias * 24 * 60 + diferencaHoras * 60 + diferencaMinutos;

    // Ajustar se o horário estiver no mesmo dia mas já passou
    if (diferencaDias == 0 && (diferencaHoras < 0 || (diferencaHoras == 0 && diferencaMinutos <= 0))) {
      diferencaTotal += 7 * 24 * 60;  // Adiciona uma semana para garantir que é o próximo disponível
    }

    // Verificar se este é o menor horário futuro encontrado
    if (diferencaTotal < menorDiferenca) {
      menorDiferenca = diferencaTotal;
      proximo = &horarios[i];
    }
  }

  if (proximo != nullptr) {
    String proximoNomeDia = diasSemana[proximo->diaSemana];
    pagina += "<p><strong>Próximo Horário:</strong> " + proximoNomeDia + ", " +
              String(proximo->hora) + ":" + (proximo->minuto < 10 ? "0" : "") +
              String(proximo->minuto) + "</p>";
  } else {
    pagina += "<p><strong>Nenhum horário programado.</strong></p>";
  }

  pagina += "<form action='/testar'><button style='background-color: #4CAF50; color: white;'>Testar Sirene</button></form>";
  pagina += "<form action='/limparHorarios'><button style='background-color: #f44336; color: white;'>Limpar Horários</button></form>";

  pagina += "<form action='/configurarDuracao' method='post'>";
  pagina += "Duração (1-60s): <input type='number' name='duracao' min='1' max='60'>";
  pagina += "<button>Configurar</button></form>";

  pagina += "<form action='/adicionarHorario' method='post'>";
  pagina += "Dia (0=Dom, 6=Sáb): <input type='number' name='dia' min='0' max='6'>";
  pagina += "Hora: <input type='number' name='hora' min='0' max='23'>";
  pagina += "Minuto: <input type='number' name='minuto' min='0' max='59'>";
  pagina += "<button>Adicionar Horário</button></form>";

  pagina += "<form action='/ativarRelogio'><button>Ativar Relógio</button></form>";
  pagina += "<form action='/desativarRelogio'><button>Desativar Relógio</button></form>";

  pagina += "<form action='/atualizarHorario'><button>Atualizar Horário via NTP</button></form>";

  pagina += "<div style='text-align: center; margin-top: 20px;'><a href='/logs'>Ver Logs</a></div>";
  pagina += "</div></body></html>";

  server.send(200, "text/html", pagina);
}
// Exibe os logs na página web
void handleLogs() {
  // Monta a página de logs com melhor formatação e codificação UTF-8
  String pagina = "<!DOCTYPE html><html><head><meta charset='UTF-8'>";
  pagina += "<style>";
  pagina += "body { font-family: Arial, sans-serif; background-color: #f5f5f5; margin: 20px; }";
  pagina += "h1 { text-align: center; color: #333; }";
  pagina += ".container { max-width: 700px; margin: auto; background-color: #fff; padding: 20px; ";
  pagina += "border-radius: 10px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); }";
  pagina += "pre { background-color: #f8f8f8; padding: 15px; border-radius: 5px; overflow-x: auto; }";
  pagina += ".button { display: block; width: 100px; margin: 20px auto; text-align: center; ";
  pagina += "padding: 10px; background-color: #6200ee; color: white; border: none; border-radius: 5px; ";
  pagina += "cursor: pointer; text-decoration: none; }";
  pagina += ".button:hover { background-color: #3700b3; }";
  pagina += "</style></head><body>";

  pagina += "<div class='container'>";
  pagina += "<h1>Logs</h1>";
  pagina += "<pre>" + logsWeb + "</pre>";  // Exibe os logs formatados

  pagina += "<a href='/' class='button'>Voltar</a>";
  pagina += "</div></body></html>";

  server.send(200, "text/html", pagina);
}

// Testa a sirene manualmente
void handleTestarSirene() {
  acionarSirene();
  server.send(200, "text/html", "<html><body><h1>Sirene Testada!</h1><a href='/'>Voltar</a></body></html>");
}

// Adiciona um novo horário
void handleAdicionarHorario() {
  if (totalHorarios < 64) {
    int dia = server.arg("dia").toInt();
    int hora = server.arg("hora").toInt();
    int minuto = server.arg("minuto").toInt();
    horarios[totalHorarios++] = { dia, hora, minuto };
    String log = "Horário adicionado: Dia " + String(dia) + ", " + String(hora) + ":" + String(minuto);
    Serial.println(log);
    logsWeb += log + "<br>";
  }
  salvarHorarios();
  server.send(200, "text/html", "<html><body><h1>Horário Adicionado!</h1><a href='/'>Voltar</a></body></html>");
}

// Limpa todos os horários
void handleLimparHorarios() {
  totalHorarios = 0;
  logsWeb += "Horários limpos.<br>";
  Serial.println("Horários limpos.");
  salvarHorarios();  // Salva após limpar
  server.send(200, "text/html", "<html><body><h1>Horários Limpados!</h1><a href='/'>Voltar</a></body></html>");
}

// Configura a duração da sirene
void handleConfigurarDuracao() {
  int novaDuracao = server.arg("duracao").toInt();
  if (novaDuracao >= 1 && novaDuracao <= 60) {
    duracaoSirene = novaDuracao;
    logsWeb += "Duração configurada para " + String(novaDuracao) + " segundos.<br>";
    Serial.println("Duração configurada para " + String(duracaoSirene) + " segundos.");

    salvarHorarios();  // Salva a nova duração na EEPROM
  }
  server.send(200, "text/html", "<html><body><h1>Duração Configurada!</h1><a href='/'>Voltar</a></body></html>");
}

void handleAtualizarHorario() {
  // Hora antes da sincronização
  String horaAntes = timeClient.getFormattedTime();
  
  // Atualiza o horário via NTP
  timeClient.update();

  // Hora depois da sincronização
  String horaDepois = timeClient.getFormattedTime();

  // Calcula a diferença de horário
  int segundosAntes = timeClient.getEpochTime();
  timeClient.update();
  int segundosDepois = timeClient.getEpochTime();
  int diferenca = abs(segundosDepois - segundosAntes);

  // Log e resposta da operação
  String log = "Horário atualizado via NTP. Antes: " + horaAntes + ", Depois: " + horaDepois + 
               ". Diferença: " + String(diferenca) + " segundos.";
  logsWeb += log + "<br>";
  Serial.println(log);

  // Resposta HTML para o usuário
  String pagina = "<html><body><h1>Horário Atualizado!</h1>";
  pagina += "<p>" + log + "</p>";
  pagina += "<a href='/'>Voltar</a></body></html>";
  server.send(200, "text/html", pagina);
}

// Ativa o relógio
void handleAtivarRelogio() {
  relogioAtivo = true;
  logsWeb += "Relógio ativado.<br>";
  server.send(200, "text/html", "<html><body><h1>Relógio Ativado!</h1><a href='/'>Voltar</a></body></html>");
}

// Desativa o relógio
void handleDesativarRelogio() {
  relogioAtivo = false;
  logsWeb += "Relógio desativado.<br>";
  server.send(200, "text/html", "<html><body><h1>Relógio Desativado!</h1><a href='/'>Voltar</a></body></html>");
}

// Verifica horários programados
void verificarHorarios() {
  int dia = timeClient.getDay();
  int hora = timeClient.getHours();
  int minuto = timeClient.getMinutes();

  if (minuto == ultimoMinuto) return;
  ultimoMinuto = minuto;

  for (int i = 0; i < totalHorarios; i++) {
    if (horarios[i].diaSemana == dia && horarios[i].hora == hora && horarios[i].minuto == minuto) {
      acionarSirene();
      break;
    }
  }
}

// Aciona a sirene
void acionarSirene() {
  logsWeb += "Sirene acionada.<br>";
  Serial.println("Sirene acionada!");
  digitalWrite(relePin, HIGH);
  delay(duracaoSirene * 1000);
  digitalWrite(relePin, LOW);
  logsWeb += "Sirene desligada.<br>";
  Serial.println("Sirene desligada.");
}

void salvarHorarios() {
  EEPROM.put(0, totalHorarios);  // Salva o total de horários
  EEPROM.put(sizeof(totalHorarios), horarios);  // Salva os horários
  EEPROM.put(sizeof(totalHorarios) + sizeof(horarios), duracaoSirene);  // Salva a duração da sirene
  EEPROM.commit();  // Grava os dados na EEPROM
  Serial.println("Horários e duração da sirene salvos na EEPROM.");
}

void carregarHorarios() {
  EEPROM.get(0, totalHorarios);  // Carrega o total de horários
  EEPROM.get(sizeof(totalHorarios), horarios);  // Carrega os horários
  EEPROM.get(sizeof(totalHorarios) + sizeof(horarios), duracaoSirene);  // Carrega a duração da sirene

  Serial.println("Horários e duração da sirene carregados da EEPROM:");
  for (int i = 0; i < totalHorarios; i++) {
    Serial.printf("Dia %d - %02d:%02d\n", 
                  horarios[i].diaSemana, 
                  horarios[i].hora, 
                  horarios[i].minuto);
  }
  Serial.println("Duração da sirene: " + String(duracaoSirene) + " segundos");
}
