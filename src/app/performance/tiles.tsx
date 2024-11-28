export default function Tiles({ title, value }: { title: string, value: string }) {
    return (
        <div className=" shadow-xl rounded-xl pt-8 pb-4 px-8  flex flex-col items-center justify-center">
            <h1 className=" text-md font-medium text-muted-foreground">
                {title}
            </h1>
            <p className=" text-xl font-bold text-primary">{value}</p>
        </div>
    )
}
