// Funções auxiliares para obter URLs com prioridade para coordenadas

function obterUrlGoogleMaps(item) {
    if (item.latitude && item.longitude) {
        return `https://www.google.com/maps/search/?api=1&query=${item.latitude},${item.longitude}`;
    } else if (item.endereco) {
        const enderecoCompleto = encodeURIComponent(item.endereco + ', Nampula, Moçambique');
        return `https://www.google.com/maps/search/?api=1&query=${enderecoCompleto}`;
    }
    return '#';
}

function obterUrlWaze(item) {
    if (item.latitude && item.longitude) {
        return `https://www.waze.com/ul?ll=${item.latitude},${item.longitude}&navigate=yes`;
    } else if (item.endereco) {
        const enderecoCompleto = encodeURIComponent(item.endereco + ', Nampula, Moçambique');
        return `https://www.waze.com/ul?q=${enderecoCompleto}&navigate=yes`;
    }
    return '#';
}

function obterUrlDirecoes(item) {
    if (item.latitude && item.longitude) {
        return `https://www.google.com/maps/dir/?api=1&destination=${item.latitude},${item.longitude}`;
    } else if (item.endereco) {
        const enderecoCompleto = encodeURIComponent(item.endereco + ', Nampula, Moçambique');
        return `https://www.google.com/maps/dir/?api=1&destination=${enderecoCompleto}`;
    }
    return '#';
}
