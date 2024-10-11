import { Tooltip } from "react-tooltip";

export default function DefaultCard(props: any) {
  let { title, value, subtitle, image, percentage, tooltipText } = props;

  let percentageGraph = percentage;
  if (percentage && percentage > 100) {
    console.log('es mayor a 100 el porcentaje', percentage)
    percentageGraph = 100;
  }
  return (
    <div className="p-4 relative border rounded-lg shadow-[rgba(221,222,227,1)_1px_1px_4px_0px] text-dark-900 bg-custom-fondo w-full flex items-center animate-fade animate-ease-in animate-duration-300 h-24">
      <a className='absolute top-2 right-2' data-tooltip-id="my-tooltip" data-tooltip-content={tooltipText}> <svg  xmlns="http://www.w3.org/2000/svg"  width="20"  height="20"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  strokeWidth="2"  strokeLinecap="round"  strokeLinejoin="round"  className="icon icon-tabler icons-tabler-outline icon-tabler-info-circle"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0" /><path d="M12 9h.01" /><path d="M11 12h1v4h1" /></svg>
      </a>
      <div className="flex flex-col justify-start w-[80%]">
        <h4 className="text-sm font-semibold">{title || 'Title'}</h4>
        <p className="text-xs text-[#a7a7a7]">{subtitle || ' '}</p>
        <p className="text-xl font-bold">{value || ''}</p>
      </div>
      <div className="w-[20%] flex justify-center items-center mr-4">
        {image && (
          <img src={`/images/icons/${image}.png`} className="max-h-10" />
        )}
        {percentage && (
          <div className="relative w-14 h-14">
            <svg className="w-full h-full" viewBox="0 0 100 100">
              <circle
                className="text-gray-200 stroke-current"
                strokeWidth="10"
                cx="50"
                cy="50"
                r="40"
                fill="transparent"
              ></circle>
              <circle
                className=" progress-ring__circle stroke-current text-custom-dark-hover"
                strokeWidth="10"
                strokeLinecap="round"
                cx="50"
                cy="50"
                r="40"
                fill="transparent"
                stroke-dashoffset={`calc(3.14 * (-0.8 * ${percentageGraph} + 128))`}
              ></circle>
              <text
                x="52"
                y="52"
                font-size="20"
                fontWeight={500}
                text-anchor="middle"
                alignment-baseline="middle"
              >
                {percentage}%
              </text>
            </svg>
          </div>
        )}
      </div>
  <Tooltip id="my-tooltip" />
    </div>
  );
}
