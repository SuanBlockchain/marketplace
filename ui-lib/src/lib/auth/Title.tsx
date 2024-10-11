const Title = () => {
  const marketplaceName =
  process.env.NEXT_PUBLIC_MARKETPLACE_NAME || 'Marketplace';
const marketplaceColors: Record<
  string,
  {
    bgColor: string;
    hoverBgColor: string;
    bgColorAlternativo: string;
    fuente: string;
    fuenteAlterna: string;
    fuenteVariante:string;
  }
> = {
  Terrasacha: {
    bgColor: 'bg-custom-marca-boton',
    hoverBgColor: 'hover:bg-custom-marca-boton-variante',
    bgColorAlternativo: 'bg-custom-marca-boton-alterno2',
    fuente: 'font-jostBold',
    fuenteAlterna: 'font-jostRegular',
    fuenteVariante: 'font-jostItalic',
  },

  // Agrega más marketplaces y colores aquí
};
const colors = marketplaceColors[marketplaceName] || {
  bgColor: 'bg-custom-dark',
  hoverBgColor: 'hover:bg-custom-dark-hover',
  bgColorAlternativo: 'bg-amber-400',
  fuente: 'font-semibold',
  fuenteAlterna: 'font-medium',
  fuenteVariante: 'font-normal',
};
  return (
    <div className={` w-2/5 flex-col justify-center text-white hidden 2xl:flex`}>
      <h1 className={`${colors.fuente} text-7xl tracking-wide font-normal pb-1`}>
        Aceleramos la{' '}
      </h1>
      <h1 className={`${colors.fuente} text-7xl tracking-wide font-normal pb-1`}>
        transición hacia{' '}
      </h1>
      <h1 className={`${colors.fuente} text-7xl tracking-wide font-normal pb-1`}>mundo de</h1>
      <h1 className={`${colors.fuente} text-7xl tracking-wide font-normal pb-1`}>
        carbono neutral
      </h1>
      <p className={`${colors.fuenteVariante} text-2xl font-tracking-normal pt-20`}>
        Somos un motor alternativo para facilitar el desarrollo, financiación e
        implementación de proyectos de mitigación de cambio climático
      </p>
    </div>
  );
};

export default Title;