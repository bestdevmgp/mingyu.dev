const bar = "skeleton-bar bg-foreground/10 rounded-sm";

const Line = ({ box, width }: { box: string; width: string }) => (
  <div className={`flex items-center ${box}`}>
    <div className={`${bar} h-3.5 ${width}`} />
  </div>
);

const CHIP_COUNT = 10;
const INFO_COLUMNS = [
  { key: "member", label: "w-16", value: "w-64" },
  { key: "period", label: "w-10", value: "w-32" },
  { key: "links", label: "w-16", value: "w-48" },
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

      <div className="flex flex-col mb-4">
        <div className="flex items-center h-[30px] md:h-9">
          <div className={`${bar} h-6 md:h-7 w-3/5`} />
        </div>
        <div className="flex items-center h-[30px] md:hidden">
          <div className={`${bar} h-6 w-2/5`} />
        </div>
      </div>

      <div className="flex gap-6 flex-wrap">
        <div className="flex flex-col gap-1 w-full">
          <Line box="h-5" width="w-24" />
          <div className="flex flex-col">
            <Line box="h-5" width="w-3/5" />
            <div className="md:hidden">
              <Line box="h-5" width="w-2/5" />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-1 w-full">
          <Line box="h-5" width="w-20" />
          <div className="flex gap-2 flex-wrap">
            {Array.from({ length: CHIP_COUNT }, (_, index) => (
              <div key={`skeleton-chip-${index}`} className={`skeleton-bar bg-foreground/10 rounded-md w-7 h-7`} />
            ))}
          </div>
        </div>

        {INFO_COLUMNS.map(({ key, label, value }) => (
          <div key={`skeleton-info-${key}`} className="flex flex-col gap-1 max-w-full">
            <Line box="h-5" width={label} />
            <Line box="h-5" width={`${value} max-w-full`} />
          </div>
        ))}
      </div>
    </div>

    <div className="w-full h-px min-h-px bg-foreground/10 my-10 md:my-12" />

    <div className="flex flex-col gap-2">
      <div className="flex items-center h-6 md:h-7">
        <div className={`${bar} h-5 md:h-6 w-24`} />
      </div>

      <ol className="list-none p-0 m-0 indent-0">
        {ITEMS.map(({ key, title, lines, image }) => (
          <li key={`skeleton-item-${key}`} className="mb-6 md:mb-8 last:mb-0 indent-0">
            <Line box="h-6" width={title} />
            <div className="flex flex-col mt-1.5 ml-5">
              {lines.map((width, index) => (
                <Line key={`skeleton-line-${key}-${index}`} box="h-6" width={width} />
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
