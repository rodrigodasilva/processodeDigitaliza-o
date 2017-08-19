var xn = [];
var xt = [];
var xq = [];
var xe = [];
var cod_decimal = [];
var cod_binario = [];
var N = 0;

//Variavel para armazenar os pontos para plotagem do eixo x
var labels_eixo_x = []; 

//---- Carrega os eixos do grafico antes de pressionar o botão 'calcular'
window.onload = function(){
    var ctx = $(".analogico-amostrado");
    var chartGraph = new Chart(ctx, {
    	type: 'bar',
    });

    var ctx3 = $(".quantizado");
    chartGraph = new Chart(ctx3, {
    	type: 'bar',
    });

    /*var ctx4 = $(".erro");
    chartGraph = new Chart(ctx4, {
    	type: 'bar',
    });*/
}

//Quando o documento estiver carregado leia a função main
$(document).ready(main);

//FUNCAO PRINCIPAL
function main() {
	//Inicia os calculos quando 'calcular' é clicado
	$("form").on("submit", function() {
		event.preventDefault();

		//Valida os dados 
		if($('#fs').val() == '') {
			alert("Digite a frequência de amostragem");
			return false;
		}
		if($('#bits').val() == '') {
			alert("Digite a quantidade de bits desejada");
			return false;
		}

		//Deleta o elemento canvas e chama novamente
		//deletaCanvas();

		//Captura os dados do formulario
		var fs = $("#fs").val();
		var bits = $("#bits").val();

		//Converte N e fs para inteiros
		bits = parseFloat(bits);
		fs = parseFloat(fs);
		N = Math.pow(2,bits);

		//console.log("N: " + N);
		//console.log("fs: " + fs);
		//console.log("ts: " + ts);


		//==== CALCULA xt =========================
		for (var t=0; t<N; t++) {			
				xt[t] = Math.sin((2*Math.PI)*1*t);
		}
		console.log("xt = " + xt);	

		// === Calcula os intervalos de quantização ========
		var vmax = 1;
		var vmin = -1;
		var delta_q = (vmax - vmin)/N;
		var nivel_quantizacao = [];
		var num_aux = vmax;
		var num1=[];
		var num2=[];

		for (var i=0; i<N; i++) {

			num1[i] = num_aux;
			num2[i] = num1[i] - delta_q;
			num_aux = num2[i];

			nivel_quantizacao[i] = (num1[i] + num2[i]) / 2; //Nivel de quantização = (num1 + num2) / 2
			nivel_quantizacao[i] = (nivel_quantizacao[i]).toFixed(4);
		}

		//==== CALCULA xn =========================
		for (var n=0; n<N; n++) {			
				xn[n] = (Math.sin((2*Math.PI)*n/fs)).toFixed(4);
				labels_eixo_x[n] = n
		}
	
		//console.log("xn = " + xn);
		console.log("nivel q = " +nivel_quantizacao);

		var subtracao = [];
		var aux;
		// ===== CALCULA A QUANTIZAÇÃO =======================
		//PERCORRER ARRAY xn[] e QUANTIZAR OS PONTOS DE ACORDO COM O ARRAY nivel_quantizacao[]
		for(var i=0; i<N; i++){
			for(var j=0; j<N; j++){
				
				subtracao[i] = xn[i] - nivel_quantizacao[j]; 
				subtracao[i] = Math.abs(subtracao[i]); //Converte o valor da subtracao para positivo

				if (subtracao[i] < aux) { //Compara com o valor da posição anterior gravado em "aux"
					xq[i] = (nivel_quantizacao[j]);
				} 
				aux = subtracao[i];
			}
		}

		// ======= CALCULA O ERRO ======================
		for (var i=0; i<N; i++){
			xe[i] = (xn[i] - xq[i]).toFixed(4);
		}


		var inverteNiveisQuantizacao = nivel_quantizacao.reverse(); //Inverte os valores do 'nivel_quantizacao' para calcular a 'codificacao'
		// ======== CODIFICAÇÃO ======================
		for(var i=0; i<N; i++) {
			for(var j=N-1; j>=0; j--){
				if(xq[i] == inverteNiveisQuantizacao[j]) {
					cod_decimal[i] = j; 
					cod_binario[i] = (j).toString(2);
				}
			}
		}
		console.log("codificação = " + cod_decimal /*+ " | " + cod_binario*/);
		console.log("xq = " + xq);
		//console.log("xe = " + xe);

		//Remove os itens 'li' para o caso de já haver elementos 
		//E Imprime os valores no quadro 'Resultados'
		$("ul>li").remove();
		for (var i = 0; i< N; i++){
			//console.log("x[" + i + "]= " + xn[i]);
			$("#lista-amostragem").append("<li>xn["+ i + "]= " + xn[i] + "</li>");
			$("#lista-quantizacao").append("<li>xq["+ i + "]= " + xq[i] + "</li>");
			$("#lista-erro").append("<li>xe["+ i + "]= " + xe[i] + "</li>");
			$("#lista-codificacao").append("<li>" + cod_decimal[i] + " | " + cod_binario[i] + "</li>");
		}
		
		//Plota os gráficos
		plotaGraficoAnalogicoAmostrado();
		plotaGraficoQuantizado();

		$(this)[0].reset();//Reseta o formulario quando o botao 'calcular' é clicado
			
	}); 

	//======= Funções para comandar a exibicao de cada grafico ================
	$('#btn-analogico-amostrado').click( function() {
		$("#grafico-analogico-amostrado").show(); //Exibe grafico analogico/amostrado
		$("#grafico-quantizado").hide();
		$("#btn-analogico-amostrado").css("border-bottom-color", "white");
		$("#btn-quantizado").css("border-bottom-color", "lightgray");
	});

	$('#btn-quantizado').click( function() {
		$("#grafico-analogico-amostrado").hide(); 
		$("#grafico-quantizado").show();//exibe grafico quantizado
		$("#btn-analogico-amostrado").css("border-bottom-color", "lightgray");
		$("#btn-quantizado").css("border-bottom-color", "white");
	});

	//=== Função para alter titulo e subtitulo quando a largura da tela estiver menor 
	$(window).resize(function(){
		var tela = $("body").width();
		if(tela<990){
			$("#titulo").text('PDS');
			$("#div-graficos").css("margin-top", "15px");
			$("#div-graficos").css("height", "100%");
		}
		else{
			$("#titulo").text('Processamento Digital de Sinais');
			$("#div-graficos").css("padding-left", "15px");
			$("#div-graficos").css("margin-top", "0px");
			$("#div-graficos").css("height", "454px");
		}
		if(tela<700){
			$("#subtitulo").hide();
		}
		else{
			$("#subtitulo").show();
		}
		});
}

//FUNCAO PARA PLOTAGEM DO GRAFICO ANALOGICO
function plotaGraficoAnalogicoAmostrado() {

	var chartData = {
		labels: labels_eixo_x,
		datasets: [{
			type: 'line',
			label: 'ANALOGICO',
			borderColor: 'rgba(77,166,253, 0.8)',
			backgroundColor: 'rgba(77,166,253, 0.4)',
			borderWidth: 2,
			fill: false,
			pointRadius: 1,
			data: xn,
		}, {
			type: 'bar',
			label: 'AMOSTRADO',
			borderColor: 'rgba(0,0,0,0.9)',
			backgroundColor: 'rgba(0,0,0,0.4)',
			borderWidth: 1,
			data: xn,
		}]
	};

	var ctx_analogico_amostrado = $(".analogico-amostrado");

	var chartGraph = new Chart(ctx_analogico_amostrado, {
		type: 'bar',
		data: chartData,
		options: {
			responsive: true,
			tooltips: {
				mode: 'index',
				intersect: true
			},
			scales: {xAxes: [{ barThickness: 1 }]} 
		}
	});

}


//FUNCAO PARA PLOTAGEM DO GRAFICO QUANTIZADO
function plotaGraficoQuantizado() {

	var ctx_quantizado = $(".quantizado");	

	//Type, Data, Options
	var chartGraph = new Chart(ctx_quantizado, {
		type: 'bar',
	   	data: {
	    		labels: labels_eixo_x,
	    		datasets: [
	    			{
		    			label: "QUANTIZADO",
		    			borderWidth: 1,
		    			borderColor: "rgba(197,23,1,0.8)",
		    			backgroundColor: "rgba(197,23,1,0.8)",
	    				data: xq,
	    			},
	    		]
	    },
	    options: {
	    		scales: {
	    			yAxes: [{
               			ticks: {
                    		beginAtZero:true
                		}
           			}],
            		xAxes: [{ //barThickness: 2 
            			categoryPercentage: 1,
            			barPercentage: 1,
            		}], //Define a largura da barra para 1 pixels
        		}	
	    }
	});
}