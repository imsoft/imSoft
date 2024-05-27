interface Props {
  title: string;
  description: string;
  text1: string;
  text2: string;
  text3: string;
}

export const SecondSection = ({
  title,
  description,
  text1,
  text2,
  text3,
}: Props) => {
  return (
    <>
      <div className="pt-12 sm:pt-16 md:pt-36">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              {title}
            </h2>
            <p className="mt-3 text-xl text-gray-500 sm:mt-4">
              {description}
            </p>
          </div>
        </div>
        <div className="mt-10 bg-white pb-12 sm:pb-16">
          <div className="relative">
            <div className="absolute inset-0 h-1/2" />
            <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
              <div className="mx-auto max-w-4xl">
                <dl className="rounded-lg bg-white shadow-lg sm:grid sm:grid-cols-3">
                  <div className="flex flex-col border-b border-gray-100 p-6 text-center sm:border-0 sm:border-r">
                    <dt className="order-2 mt-2 text-lg font-medium leading-6 text-gray-500">
                      {text1}
                    </dt>
                    <dd className="order-1 text-5xl font-bold tracking-tight text-primary-500">
                      100%
                    </dd>
                  </div>
                  <div className="flex flex-col border-t border-b border-gray-100 p-6 text-center sm:border-0 sm:border-l sm:border-r">
                    <dt className="order-2 mt-2 text-lg font-medium leading-6 text-gray-500">
                      {text2}
                    </dt>
                    <dd className="order-1 text-5xl font-bold tracking-tight text-primary-500">
                      +20
                    </dd>
                  </div>
                  <div className="flex flex-col border-t border-gray-100 p-6 text-center sm:border-0 sm:border-l">
                    <dt className="order-2 mt-2 text-lg font-medium leading-6 text-gray-500">
                      {text3}
                    </dt>
                    <dd className="order-1 text-5xl font-bold tracking-tight text-primary-500">
                      +8
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
