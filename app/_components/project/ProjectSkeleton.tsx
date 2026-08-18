const bar = "skeleton-bar bg-foreground/10 rounded-sm";

const CHIP_WIDTHS = ["w-7", "w-7", "w-7", "w-7", "w-7", "w-7", "w-7", "w-7", "w-7", "w-7", "w-7", "w-7"];
const INFO_COLUMNS = [
  { label: "w-16", value: "w-64" },
  { label: "w-10", value: "w-32" },
  { label: "w-16", value: "w-48" },
];
const ITEMS = [
  { key: "a", title: "w-16", lines: ["w-full", "w-3/4", "w-full", "w-2/3"], image: true },
  { key: "b", title: "w-1/2", lines: ["w-full", "w-full", "w-4/5"], image: false },
  { key: "c", title: "w-2/5", lines: ["w-full", "w-5/6"], image: false },
];

const ProjectSkeleton = () => (
  <>
    <div className="flex flex-col gap-3 md:gap-6">
      <div className={`${bar} w-8 h-8 md:w-12 md:h-12`} />

      <div className="flex flex-col gap-1.5 mb-4">
        <div className={`${bar} h-6 md:h-7 w-full`} />
        <div className={`${bar} h-6 w-3/5 md:hidden`} />
      </div>

      <div className="flex gap-6 flex-wrap">
        <div className="flex flex-col gap-1 w-full">
          <div className={`${bar} h-5 w-24`} />
          <div className={`${bar} h-5 w-full`} />
          <div className={`${bar} h-5 w-4/5 md:hidden`} />
        </div>

        <div className="flex flex-col gap-1 w-full">
          <div className={`${bar} h-5 w-20`} />
          <div className="flex gap-2 flex-wrap">
            {CHIP_WIDTHS.map((width, index) => (
              <div key={`skeleton-chip-${index}`} className={`skeleton-bar bg-foreground/10 rounded-md h-7 ${width}`} />
            ))}
          </div>
        </div>

        {INFO_COLUMNS.map(({ label, value }) => (
          <div key={`skeleton-info-${label}-${value}`} className="flex flex-col gap-1 max-w-full">
            <div className={`${bar} h-5 ${label}`} />
            <div className={`${bar} h-5 ${value} max-w-full`} />
          </div>
        ))}
      </div>
    </div>

    <div className="w-full h-px min-h-px bg-foreground/10 my-10 md:my-12" />

    <div className="flex flex-col gap-2">
      <div className={`${bar} h-6 md:h-7 w-24`} />

      <ol className="list-none p-0 m-0 indent-0">
        {ITEMS.map(({ key, title, lines, image }) => (
          <li key={`skeleton-item-${key}`} className="mb-6 md:mb-8 last:mb-0 indent-0">
            <div className={`${bar} h-5 ${title}`} />
            <div className="flex flex-col gap-1 mt-2.5 ml-5">
              {lines.map((width, index) => (
                <div key={`skeleton-line-${key}-${index}`} className={`${bar} h-5 ${width}`} />
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
