const bar = "skeleton-bar bg-foreground/10 rounded-sm";

const CHIP_WIDTHS = ["w-16", "w-20", "w-14", "w-24", "w-16", "w-20"];
const ITEMS = [
  { title: "w-56", lines: ["w-full", "w-full", "w-4/5"], image: true },
  { title: "w-2/5", lines: ["w-full", "w-full", "w-3/4"], image: false },
  { title: "w-1/2", lines: ["w-full", "w-5/6"], image: false },
];

const ProjectSkeleton = () => (
  <>
    <div className="flex flex-col gap-3 md:gap-6">
      <div className={`${bar} w-8 h-8 md:w-12 md:h-12`} />

      <div className="flex flex-col gap-2 mb-4">
        <div className={`${bar} h-6 md:h-7 w-full`} />
        <div className={`${bar} h-6 w-3/5 md:hidden`} />
      </div>

      <div className="flex gap-6 flex-wrap">
        <div className="flex flex-col gap-1.5 w-full">
          <div className={`${bar} h-3.5 w-24`} />
          <div className={`${bar} h-3.5 w-full`} />
          <div className={`${bar} h-3.5 w-4/5 md:hidden`} />
        </div>

        <div className="flex flex-col gap-1.5 w-full">
          <div className={`${bar} h-3.5 w-20`} />
          <div className="flex gap-2 flex-wrap">
            {CHIP_WIDTHS.map(width => (
              <div key={`skeleton-chip-${width}`} className={`skeleton-bar bg-foreground/10 rounded-md h-7 ${width}`} />
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <div className={`${bar} h-3.5 w-16`} />
          <div className={`${bar} h-3.5 w-64 max-w-full`} />
        </div>

        <div className="flex flex-col gap-1.5">
          <div className={`${bar} h-3.5 w-10`} />
          <div className={`${bar} h-3.5 w-32`} />
        </div>
      </div>
    </div>

    <div className="w-full h-px min-h-px bg-foreground/10 my-10 md:my-12" />

    <div className="flex flex-col gap-2">
      <div className={`${bar} h-5 md:h-6 w-24`} />

      <ol className="list-none p-0 m-0 indent-0">
        {ITEMS.map(({ title, lines, image }) => (
          <li key={`skeleton-item-${title}`} className="mb-6 md:mb-8 last:mb-0 indent-0">
            <div className={`${bar} h-3.5 ${title}`} />
            <div className="flex flex-col gap-2 mt-3 ml-5">
              {lines.map(width => (
                <div key={`skeleton-line-${title}-${width}`} className={`${bar} h-3.5 ${width}`} />
              ))}
            </div>
            {image && <div className={`${bar} w-full aspect-[3/2] mt-4`} />}
          </li>
        ))}
      </ol>
    </div>
  </>
);

export default ProjectSkeleton;
