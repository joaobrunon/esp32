window.jsPDF = window.jspdf.jsPDF;
window.html2canvas = html2canvas;
//**************************************************************************************

var text = "-- Selecione --";
function MultSeletores(id) {
    $(id).multiSelect();
    //Evento para pegar os valores selecionados
    onClickHorario();
};
function LimpaValor() {
    $("#hdValor").val("");
}
function LimpaListaHorario() {
    $(".mutliSelect option:selected").removeAttr('selected');
    $(".mutliSelect option:selected").prop("selected", false);
    $(".mutliSelect option").trigger('change');
}
function LimpaLista(valeu) {

    $(".mutliSelect [value=" + valeu + "][selected='selected']").removeAttr('selected');
    $(".mutliSelect [value=" + valeu + "][selected='selected']").prop("selected", false);
    $(".mutliSelect option").trigger('change');

}
function LimpaListaFull() {

    $(".mutliSelect option:selected").removeAttr('selected');
    $(".mutliSelect option:selected").prop("selected", false);
    $(".mutliSelect option").trigger('change');

}
function LimpaComboHorario() {
    //setTimeout(() => {
    //    $(".multi-select-menuitems").empty();
    //}, 100)

    $(".multi-select-menuitems").empty();
}
function LimpaCombo() {
    $(".multi-select-menuitems").empty();
}
function onClickHorario() {
    $(".multi-select-menuitems input[type='checkbox']").click(function () {
        var val = $(this).val();
        if ($("#hdValor").val() != val) {
            $("#hdValor").val(val);
            var myElement = $("#hdValor")[0];
            var event = new Event('change');
            myElement.dispatchEvent(event);
        };
    });
}
function onClick() { 
    $(".multi-select-menuitems input[type='checkbox']").click(function () {
        var val = $(this).val();
        if ($("#hdValor").val() != val) {
            $("#hdValor").val(val);
            var myElement = $("#hdValor")[0];
            var event = new Event('change');
            myElement.dispatchEvent(event);
        };
    });
}

//Selecionando e exibindo a label do que selecionado
function SelecionaHoarios(horario) {
    
    $(".multi-select-menuitems input[type='checkbox']").each(function () {
        var hr = $(this).val();
        
        if (horario == hr) {
        
            $(this).prop('checked', 'checked');
            $(this).attr('checked', 'checked');
        }
    })

    $(".mutliSelect option[value='" + horario + "']").attr('selected', 'selected');
    $(".mutliSelect option[value='" + horario + "']").prop('selected', 'selected');
    $(".mutliSelect option[value='" + horario + "']").trigger('change');
}
function Selecionar(dados) {
    
    $(".multi-select-menuitems input[type='checkbox']").each(function () {
        var valor = $(this).val();
        if (dados.value == valor) {
            
            $(this).prop('checked', 'checked');
            $(this).attr('checked', 'checked');
        }
    })

    $(".mutliSelect option[value='" + dados.value + "']").attr('selected', 'selected');
    $(".mutliSelect option[value='" + dados.value + "']").prop('selected', 'selected');
    $(".mutliSelect option").trigger('change');
}
function msgValidHorario(horarioValido) {
    if (horarioValido == 0) {
        $("span.multi-select-button").addClass("invalid");
        $("#msgValidaHorario").show();
    } else {
        $("span.multi-select-button").removeClass("invalid");
        $("#msgValidaHorario").hide();
    }
}

function MarcaLinhaSelecionada(horarios) {
    $.each(horarios, function (index, item) {
        var count = 0;
        var horario = item;
        $(".multi-select-menuitems input[type='checkbox']").each(function () {
            var hr = $(this).val();
            if (horario == hr) {
                var _label = "inputAula_" + count + "";
                $("label[for=" + _label + "]").css("background-color", "rgba(84, 217, 105, 0.29)");
            }
            count++;
        })
    })
    //$("label[for='" + nome + "']").css("background-color", "greenyellow");
}

//**************************************************************************************
// DataPicker

window.siteFunction = {
    InitDatePickerwithSelect: async function (element, formatDate, minDate, maxDate, datasLancadas, bloqSabado, bloqDomingo, calendarioEscolar, diasSemanaAula, dataProfPresente, incDate, ListaDataAula)  {
        $(element).datepicker('destroy');
        $(element).datepicker({
            dayNames: ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'],
            dayNamesMin: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab', 'Dom'],
            dayNamesShort: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'],
            monthNames: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'],
            monthNamesShort: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
            showOtherMonths: true,
            selectOtherMonths: true,
            changeMonth: true,
            changeYear: true,
            dateFormat: formatDate == null ? 'dd/mm/yy' : formatDate,
//            minDate: new Date(minDate),
//            maxDate: new Date(maxDate),
            defaultDate: new Date(incDate),
            onSelect: function (date) {
                var myElement = $(this)[0];
                var event = new Event('change');
                debugger
                myElement.dispatchEvent(event);
            },
            onChangeMonthYear: function (year, month, inst) {
                var dateNow = new Date();
                var monthNow = (dateNow.getMonth() + 1);
                var day = (monthNow != month ? "01" : dateNow.getDate());
                var myElement = $(this)[0]
                myElement.value = String(day).padStart(2, '0') + "/" + String(month).padStart(2, '0') + "/" + year;
                var event = new CustomEvent('change', { "detail": "oi" });
                myElement.dispatchEvent(event);
            },
            beforeShowDay: function (date) {
                //Dias nao letivos no Calendario Escolar e
                //finais de semana letivo
                var fimFunction = false;
                var bTipo = false;
                var desc = "";
                var classe = "";
                $.each(calendarioEscolar, function () {

                    var descricao = this.descricao;
                    var dataInicio = this.dataInicio.substr(0, 10).split('-');
                    var dataFim = this.dataFim.substr(0, 10).split('-');
                    var letivo = this.letivo;

                    var dtInic = new Date(dataInicio[0], dataInicio[1] - 1, dataInicio[2])
                    var dtFim = new Date(dataFim[0], dataFim[1] - 1, dataFim[2])

                    for (var dtI = dtInic; dtI <= dtFim; dtI.setDate(dtI.getDate() + 1)) {
                        //var dataDebugger = new Date('2024', '10', '09');
                        //if (date.toString() == dataDebugger.toString()) {
                        //    debugger
                        //}

                        if (!letivo && dtI.toString() == date.toString()) {
                            fimFunction = true;
                            bTipo = false;
                            desc = descricao;
                            classe = "DiaNaoLetivo";
                            return;
                        }
                        //Valida se sabado e Letivo no calendario escolar
                        if (letivo && date.getDay() == 6 && dtI.toString() == date.toString()) {
                            if (dataProfPresente) {
                                if (dataProfPresente.length > 0) {
                                    //Professor presente
                                    $.each(dataProfPresente, function () {
                                        var auxDataAula = this.toString().substr(0, 10).split('-');
                                        var dataAula = new Date(auxDataAula[0], auxDataAula[1] - 1, auxDataAula[2]);
                                        if (new Date(dataAula).toString() == date.toString()) {
                                            fimFunction = true;
                                            bTipo = true;
                                            desc = descricao;
                                            classe = "DiaLancar";
                                            return false;
                                        }
                                        else {
                                            fimFunction = true;
                                            bTipo = false;
                                            desc = '';
                                            classe = "";
                                            return;
                                        }
                                    });
                                }
                                else {
                                    //Marca se este sabado teve lancamento
                                    for (var i = 0; i < datasLancadas.length; i++) {
                                        if (new Date(datasLancadas[i]).toString() == date.toString()) {
                                            fimFunction = true;
                                            bTipo = true;
                                            desc = descricao;
                                            classe = "DiaLancado";
                                            return;
                                        };
                                    };

                                    //Se nao tive lancamento so libera o dia
                                    fimFunction = true;
                                    bTipo = true;
                                    desc = descricao;
                                    classe = "DiaLancar"
                                    return;
                                }
                            }
                            else {
                                //Marca se este sabado teve lancamento
                                for (var i = 0; i < datasLancadas.length; i++) {
                                    if (new Date(datasLancadas[i]).toString() == date.toString()) {
                                        fimFunction = true;
                                        bTipo = true;
                                        desc = descricao;
                                        classe = "DiaLancado";
                                        return;
                                    };
                                };

                                //Se nao tive lancamento so libera o dia
                                fimFunction = true;
                                bTipo = true;
                                desc = descricao;
                                classe = ""
                                return;
                            }                            
                        }

                        //Valida se domingo e Letivo no calendario escolar
                        if (letivo && date.getDay() == 0 && dtI.toString() == date.toString()) {
                            if (dataProfPresente) {
                                if (dataProfPresente.length > 0) {
                                    //Professor presente
                                    $.each(dataProfPresente, function () {
                                        var auxDataAula = this.toString().substr(0, 10).split('-');
                                        var dataAula = new Date(auxDataAula[0], auxDataAula[1] - 1, auxDataAula[2]);
                                        if (new Date(dataAula).toString() == date.toString()) {
                                            fimFunction = true;
                                            bTipo = true;
                                            desc = descricao;
                                            classe = "DiaLancar";
                                            return false;
                                        }
                                        else {
                                            fimFunction = true;
                                            bTipo = false;
                                            desc = '';
                                            classe = "";
                                            return;
                                        }
                                    });
                                }
                                else {
                                    //Marca se este domingo teve lancamento
                                    for (var i = 0; i < datasLancadas.length; i++) {
                                        if (new Date(datasLancadas[i]).toString() == date.toString()) {
                                            fimFunction = true;
                                            bTipo = true;
                                            desc = descricao;
                                            classe = "DiaLancado"
                                            return;
                                        };
                                    };
                                    //Se nao tive lancamento so libera o dia
                                    fimFunction = true;
                                    bTipo = true;
                                    desc = descricao;
                                    classe = "";
                                    return;
                                }
                            }
                            else {
                                //Marca se este domingo teve lancamento
                                for (var i = 0; i < datasLancadas.length; i++) {
                                    if (new Date(datasLancadas[i]).toString() == date.toString()) {
                                        fimFunction = true;
                                        bTipo = true;
                                        desc = descricao;
                                        classe = "DiaLancado"
                                        return;
                                    };
                                };
                                //Se nao tive lancamento so libera o dia
                                fimFunction = true;
                                bTipo = true;
                                desc = descricao;
                                classe = "";
                                return;
                            }
                        }
                    }

                });
                
                if (fimFunction) {
                   return [bTipo, classe, desc];
                }
                //-------------------------------------
                //Se nao tiver calentario escolar -------------------------------------
                //Marca dos dias que tem lana�amento
                for (var i = 0; i < datasLancadas.length; i++) {
                    if (new Date(datasLancadas[i]).toString() == date.toString()) {
                            
                        var msg = ("H\u00e1 lan\u00e7amento(s) neste dia.")
                        return [true, 'DiaLancado', msg];
                    };
                };
                //-----------------------------------
                //Bloqueia sabado
                if (bloqSabado) {
                    if (date.getDay() == 6) {
                        return [false, ""];
                    }
                }
                //-----------------------------------
                //Bloqueai Domingo
                if (bloqDomingo) {
                    if (date.getDay() == 0) {
                        return [false, ""];
                    }
                }
                //-----------------------------------

                //Dias Liberador na grade horaria e dentro do parametro de lana�amento

                //if (diasSemanaAula.includes(date.getDay())) {
                // Formata a Lista de Datas da Grad
                const lstDtAula = [];

                $.each(ListaDataAula, function (Key, value) {
                    var dt = value.substr(0, 10);
                    lstDtAula.push(dt);
                })
                //---------------------------------------
                //Transforma e data do calenadario e string para compara com a lista de datas da grad
                var sDia = ("0" + date.getDate());
                var sMes = ("0" + (date.getMonth() + 1))
                var sDate = date.getFullYear() + "-" + sMes.substr(sMes.length - 2) + "-" + sDia.substr(sDia.length -2);
                //-------------------------------------------------------------------------------------
                if (lstDtAula.includes(sDate)) {
                    
                    var minDt = minDate.substr(0, 10).split('-');
                    var dtPrim = new Date(minDt[0], minDt[1] - 1, minDt[2]);


                    if (dataProfPresente.length <= 0) {
                        if (date < dtPrim) {
                            return [true, 'DiaNaoLancado', 'Dia fora do prazo e sem lan\u00e7amento.'];
                        }
                    }

                    var maxDt = maxDate.substr(0, 10).split('-');
                    var dtUlt = new Date(maxDt[0], maxDt[1] - 1, maxDt[2]);
                    if (date <= dtUlt) {

                        if (dataProfPresente) {
                            if (dataProfPresente.length > 0) {
                                //Trata professor presente
                                $.each(dataProfPresente, function () {
                                    var auxDataAula = this.toString().substr(0, 10).split('-');
                                    var dataAula = new Date(auxDataAula[0], auxDataAula[1] - 1, auxDataAula[2]);
                                    if (new Date(dataAula).toString() == date.toString()) {
                                        fimFunction = true;
                                        bTipo = true;
                                        desc = 'Dia liberado para lan\u00e7amento';
                                        classe = "DiaLancar";
                                        return false;
                                    }
                                    else {
                                        fimFunction = true;
                                        bTipo = false;
                                        desc = '';
                                        classe = "";
                                        return;
                                    }
                                });

                                return [bTipo, classe, desc];
                            }
                            else {
                                return [true, 'DiaLancar', 'Dia liberado para lan\u00e7amento'];
                            }
                        }
                        else {
                            return [true, 'DiaLancar', 'Dia liberado para lan\u00e7amento'];
                        }                
                    }
                }

                //if (diasSemanaAula.includes(date.getDay())) {
                //    var minDt = minDate.substr(0, 10).split('-');
                //    var dtPrim = new Date(minDt[0], minDt[1] - 1, minDt[2]);
                //    if (date >= dtPrim) {
                //        return [false, 'DiaLancar', 'Dia pendende de lan�amento'];
                //    }
                //}
                //------------------------------------
                
                return [false, ''];
            }
        });
    },
    SetMinMaxDate: async function (element, minDate, maxDate) {
        var min = minDate == null ? null : new Date(minDate);
        var max = maxDate == null ? null : new Date(maxDate);
        $(element).datepicker('option', 'minDate', min);
        $(element).datepicker('option', 'maxDate', max);
    },
    SetTextPrev: async function (element) {
        var prevMonth = $("a.ui-datepicker-prev");

        if (prevMonth.hasClass("ui-state-disabled"))
            $(element).datepicker('option', 'prevText', 'M\u00eas anterior n\u00e3o possui dias dispon\u00edveis para lan\u00e7amento.');
        else
           $(element).datepicker('option', 'prevText', 'Prev');
    },
    ClearDatePicker: function (element) {
        //$(element).attr("disabled", "disabled");
        $(element).val('');
    },
    SetValue: async function (element, date) {
        date == null ? null : new Date(date);
        $(element).datepicker('setDate', date);
    },
    Desabilitar: async function (element) {
        $(element).datepicker('disable');
    },

}
//**************************************************************************************
function DataTable(id, colOrder = 0, order = 'asc') {
    if (!$.fn.DataTable.isDataTable(id)) {
        var url = window.location.pathname;
        if (url === "/diario-classe__frequencia___consultaDetalhes") {
            $(id).DataTable({
                ////CONGELAR DAS COLUNAS E FIXA O HEADER TABELA
                fixedColumns: {
                    start: 3
                },
                scrollCollapse: true,
                scrollX: true,
                fixedHeader: {
                    header: true,
                    footer: false
                },
                //END
                language: {
                    "processing": "Processando...",
                    "lengthMenu": "Exibir _MENU_ resultados por página",
                    "zeroRecords": "Nenhum registro encontrado",
                    "info": "Mostrando de _START_ até _END_ de _TOTAL_ registros",
                    "infoEmpty": "Mostrando 0 até 0 de 0 registro(s)",
                    "infoFiltered": "(Filtrados de _MAX_ registros)",
                    "search": "Pesquisar",
                    "emptyTable": "Nenhum registro encontrado",
                    "paginate": {
                        "next": "Próximo",
                        "previous": "Anterior",
                        "first": "Primeiro",
                        "last": "Último"
                    },
                },
                order: [colOrder, order],
                pageLength: 10,
                deferRender: true
            });
        } else {
            // Configuração padrão ou outra configuração para outras URLs
            $(id).DataTable({
                fixedHeader: {
                    header: true,
                    footer: false
                },
                jQueryUI: true,
                retrieve: true,
                pageLength: 10,
                deferRender: true,
                language: {
                    "processing": "Processando...",
                    "lengthMenu": "Exibir _MENU_ resultados por página",
                    "zeroRecords": "Nenhum registro encontrado",
                    "info": "Mostrando de _START_ até _END_ de _TOTAL_ registros",
                    "infoEmpty": "Mostrando 0 até 0 de 0 registro(s)",
                    "infoFiltered": "(Filtrados de _MAX_ registros)",
                    "search": "Pesquisar",
                    "emptyTable": "Nenhum registro encontrado",
                    "paginate": {
                        "next": "Próximo",
                        "previous": "Anterior",
                        "first": "Primeiro",
                        "last": "Último"
                    },
                },
                order: [colOrder, order],
                scrollX: true
            });
        }
    }
};
function DestroyTable(id) {
    if ($.fn.DataTable.isDataTable(id)) {
        $(id).DataTable().clear();
        $(id).DataTable().destroy();
        $(id).empty();
    }
};
function ClearTable(id) {
    if ($.fn.DataTable.isDataTable(id)) {
        $(id).DataTable().clear();
        $(id).draw();
    }
};
//**************************************************************************************

function saveAsFile(filename, bytesBase64) {
    if (navigator.msSaveBlob) {
        //Download document in Edge browser
        var data = window.atob(bytesBase64);
        var bytes = new Uint8Array(data.length);
        for (var i = 0; i < data.length; i++) {
            bytes[i] = data.charCodeAt(i);
        }
        var blob = new Blob([bytes.buffer], { type: "application/octet-stream" });
        navigator.msSaveBlob(blob, filename);
        window.navigator.msSaveOrOpenBlob(blob);
    }
    else {
        var link = document.createElement('a');
        link.download = filename;
        link.href = "data:application/octet-stream;base64," + bytesBase64;
        document.body.appendChild(link); // Needed for Firefox
        link.click();
        document.body.removeChild(link);
    }
}
//**************************************************************************************

var latitude = "";
var longitude = "";
function GeraGeoLocalizacao() {

    const options = {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
    };

    function success(pos) {
        const crd = pos.coords;
        
        console.log("Your current position is:");
        console.log(`Latitude : ${crd.latitude}`);
        console.log(`Longitude: ${crd.longitude}`);
        console.log(`More or less ${crd.accuracy} meters.`);

        latitude = crd.latitude;
        longitude = crd.longitude
    }

    function error(err) {
        console.warn(`ERROR(${err.code}): ${err.message}`);
    }
    
    navigator.geolocation.getCurrentPosition(success, error, options);

    return "Latitude: " + latitude + ' Longitude: ' + longitude;
}
function PegaGeoLocalizacao()
{
    const obj = '{"Latitude" : ' + (latitude == "" ? 0 : latitude) + ', "Longitude": ' + (longitude == "" ? 0 : longitude) + '}'
    return JSON.parse(obj);
}
//**************************************************************************************

window.isDarkModeEnabled = function () {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
};

function alternarParaTemaEscuroExe() {
    const body = document.body;
    body.classList.add('contrast');
}

function alternarParaTemaClaroExe() {
    const body = document.body;
    body.classList.remove('contrast');
}

function setCookie(name, value, minutes) {
    var expires = "";
    if (minutes) {
        var date = new Date();
        date.setTime(date.getTime() + (minutes * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/";
}

function getCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

window.startProgressBar = (progressBarId, duration) => {
    const progressBar = document.getElementById(progressBarId);
    if (progressBar) {
        progressBar.style.width = '0%';

        progressBar.offsetWidth;

        progressBar.style.transition = `width ${duration}ms linear`;
        setTimeout(() => {
            progressBar.style.width = '100%';
        }, 10); 
    }
};

window.startProgressBarDecreasing = (progressBarId, duration) => {
    const progressBar = document.getElementById(progressBarId);
    if (progressBar) {
        progressBar.style.width = '100%'; // Começa cheia

        progressBar.offsetWidth; 

        progressBar.style.transition = `width ${duration}ms linear`;
        setTimeout(() => {
            progressBar.style.width = '0%'; // Anima para vazio
        }, 10); 
    }
};


function downloadPdfFromByteArray(byteArray, fileName) {
    var fileType = fileName.endsWith(".pdf") ? "application/pdf" : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    var blob = new Blob([byteArray], { type: fileType });
    var url = URL.createObjectURL(blob);

    var a = document.createElement("a");
    a.href = url;
    a.download = fileName;  // Define o nome do arquivo aqui
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);  // Libera a URL após o download
}

function autoFillZeros(input) {
    // Remove qualquer caractere que não seja número
    input.value = input.value.replace(/[^0-9]/g, '');

    // Se o valor for menor que 12, preenche com zeros à esquerda
    input.value = ("000000000000" + input.value).slice(-12);
}