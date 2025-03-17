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
